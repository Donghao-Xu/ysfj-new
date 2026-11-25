import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { useAppState } from "@/context/AppContext";
import { db, isQuotaExceededError } from "@/lib/firebase";

export type PractitionerAction =
  | "idle"
  | "hezhang"
  | "lifo"
  | "incense"
  | "lamp"
  | "flower"
  | "woodfish"
  | "chanting"
  | "gongshou";

export type ScenePeer = {
  uid: string;
  alias: string;
  sceneId: string;
  religionType: "buddhist" | "daoist";
  action: PractitionerAction;
  slotIndex: number;
  updatedAtMs: number;
};

export const ACTION_LABELS: Record<PractitionerAction, string> = {
  idle: "静立观境",
  hezhang: "合掌静立",
  lifo: "虔诚礼佛",
  incense: "恭敬上香",
  lamp: "轻点心灯",
  flower: "殿前献花",
  woodfish: "轻叩木鱼",
  chanting: "静心诵经",
  gongshou: "拱手致敬",
};

function computeSlotIndex(uid: string): number {
  let hash = 0;
  for (let i = 0; i < uid.length; i += 1) {
    hash = (hash * 31 + uid.charCodeAt(i)) % 12;
  }
  return Math.abs(hash) % 12;
}

function sanitizeAlias(raw: string, religionType: "buddhist" | "daoist"): string {
  const cleaned = raw.trim().slice(0, 14);
  if (cleaned.length >= 1) return cleaned;
  return religionType === "daoist" ? "清修道友" : "同修居士";
}

function sanitizeSceneId(sceneId: string): string {
  const cleaned = sceneId.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return cleaned.length >= 2 ? cleaned.slice(0, 64) : "buddhist-daxiong";
}

const ACTIVE_WINDOW_MS = 90 * 1000;

export function useScenePresence({
  sceneId,
  religionType,
  currentAction,
  enabled = true,
}: {
  sceneId: string;
  religionType: "buddhist" | "daoist";
  currentAction: PractitionerAction;
  enabled?: boolean;
}) {
  const { authUser, isEmailVerified, profile } = useAppState();
  const [rawPeers, setRawPeers] = useState<ScenePeer[]>([]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [presenceError, setPresenceError] = useState(false);

  const safeSceneId = useMemo(() => sanitizeSceneId(sceneId), [sceneId]);
  const actionRef = useRef<PractitionerAction>(currentAction);
  actionRef.current = currentAction;

  // Periodic tick to expire stale presence entries cleanly
  useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 15000);
    return () => window.clearInterval(t);
  }, []);

  // Subscribe to real-time Firestore co-presence for the active scene (no chat data)
  useEffect(() => {
    if (!enabled) {
      setRawPeers([]);
      return undefined;
    }

    const q = query(
      collection(db, "scenePresence"),
      where("sceneId", "==", safeSceneId),
      where("religionType", "==", religionType),
      limit(24),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPresenceError(false);
        const list: ScenePeer[] = [];
        snapshot.forEach((snap) => {
          const data = snap.data();
          const updatedAt =
            data.updatedAt instanceof Timestamp
              ? data.updatedAt.toMillis()
              : Date.now();
          list.push({
            uid: String(data.uid || snap.id),
            alias: String(data.alias || "同修"),
            sceneId: String(data.sceneId || safeSceneId),
            religionType:
              data.religionType === "daoist" ? "daoist" : "buddhist",
            action: (data.action as PractitionerAction) || "idle",
            slotIndex:
              typeof data.slotIndex === "number" ? data.slotIndex : 0,
            updatedAtMs: updatedAt,
          });
        });
        setRawPeers(list);
      },
      (err) => {
        if (!isQuotaExceededError(err)) {
          console.warn("Presence listener paused:", err.message);
        }
        setPresenceError(true);
      },
    );

    return () => unsubscribe();
  }, [enabled, safeSceneId, religionType]);

  // Publish signed-in & verified user's live action presence and clean up on leave
  const canPublish = Boolean(enabled && authUser && isEmailVerified);
  const myUid = authUser?.uid || null;
  const myAlias = sanitizeAlias(
    profile?.displayName ||
      authUser?.displayName ||
      authUser?.email?.split("@")[0] ||
      "",
    religionType,
  );

  useEffect(() => {
    if (!canPublish || !myUid) return undefined;

    const ref = doc(db, "scenePresence", myUid);
    const slotIndex = computeSlotIndex(myUid);

    const publish = async (actionToSend: PractitionerAction) => {
      try {
        await setDoc(ref, {
          uid: myUid,
          alias: myAlias,
          sceneId: safeSceneId,
          religionType,
          action: actionToSend,
          slotIndex,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        if (!isQuotaExceededError(err)) {
          console.warn("Presence publish skipped:", err);
        }
      }
    };

    void publish(actionRef.current);

    const heartbeat = window.setInterval(() => {
      void publish(actionRef.current);
    }, 25000);

    const handlePageHide = () => {
      void deleteDoc(ref).catch(() => {});
    };
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener("pagehide", handlePageHide);
      void deleteDoc(ref).catch(() => {});
    };
  }, [canPublish, myUid, myAlias, safeSceneId, religionType]);

  // Immediately push action changes without resetting the subscription/cleanup
  useEffect(() => {
    if (!canPublish || !myUid) return;
    const ref = doc(db, "scenePresence", myUid);
    const slotIndex = computeSlotIndex(myUid);
    void setDoc(ref, {
      uid: myUid,
      alias: myAlias,
      sceneId: safeSceneId,
      religionType,
      action: currentAction,
      slotIndex,
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  }, [canPublish, myUid, myAlias, safeSceneId, religionType, currentAction]);

  const peers = useMemo(() => {
    return rawPeers.filter(
      (p) =>
        p.uid !== myUid &&
        nowMs - p.updatedAtMs <= ACTIVE_WINDOW_MS,
    );
  }, [rawPeers, myUid, nowMs]);

  return {
    peers,
    canPublish,
    presenceError,
    totalInScene: peers.length + (enabled ? 1 : 0),
  };
}
