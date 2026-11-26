import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  defaultBuildings,
  defaultGatherings,
  defaultParks,
  defaultScriptures,
  type ChantingTrack,
  type CulturalPark,
  type Gathering,
  type ParkBuilding,
  type ParkSlug,
  type Scripture,
} from "@/data/parks";
import { additionalPublicScriptures } from "@/data/v2Content";
import {
  DEFAULT_SOUND_MIXER_STATE,
  soundManager,
  type RetreatMusicTrackId,
  type SoundLayerConfig,
  type SoundLayerKey,
} from "@/lib/audio";
import {
  ADMIN_EMAIL,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  isQuotaExceededError,
  OperationType,
  testConnection,
} from "@/lib/firebase";

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  role: "member" | "admin";
  totalChantingMinutes: number;
  chantingSessionsCount: number;
  joinedGatherings: string[];
  favoriteScriptures: string[];
  visitedBuildings: string[];
};

export type ChantingLogItem = {
  id: string;
  minutes: number;
  scriptureId: string;
  scriptureTitle: string;
  category?: "buddhist" | "daoist" | "nature" | "chanting";
  createdAtMs: number;
};

export type PersonalWish = {
  id: string;
  realm: "buddhist" | "daoist" | "general";
  text: string;
  createdAtMs: number;
};

export type AppSettings = {
  defaultVolume: number;
  themeMode: "light" | "dark";
  animationMode: "full" | "reduced" | "off";
  recordRetreatLogs: boolean;
  defaultRetreatMinutes: number;
  masterMuted: boolean;
  soundLayers: Record<SoundLayerKey, SoundLayerConfig>;
  musicTrackId: RetreatMusicTrackId;
  roamingMode: "auto" | "free";
  roamingMotionEnabled: boolean;
};

export type OfferingsCount = {
  bow: number;
  incense: number;
  lamp: number;
  flower: number;
};

type LocalState = {
  joinedGatherings: string[];
  favoriteScriptures: string[];
  visitedBuildings: string[];
  totalChantingMinutes: number;
  chantingSessionsCount: number;
  chantingLogs: ChantingLogItem[];
  readingProgress: Record<string, number>;
  wishes: PersonalWish[];
  woodfishTotal: number;
  offeringsCount: OfferingsCount;
  pilgrimageVisited: string[];
  settings: AppSettings;
};

const LOCAL_STORAGE_KEY = "ysfj_local_practice_v2";
const CONTENT_CACHE_KEY = "ysfj_content_cache_v2";

const defaultV2Scriptures: Scripture[] = [
  ...defaultScriptures,
  ...additionalPublicScriptures.filter(
    (extra) => !defaultScriptures.some((d) => d.id === extra.id),
  ),
];

function mergeWithAdditionalScriptures(list: Scripture[]): Scripture[] {
  const existingIds = new Set(list.map((s) => s.id));
  return [
    ...list,
    ...additionalPublicScriptures.filter((extra) => !existingIds.has(extra.id)),
  ];
}

function loadLocalState(): LocalState {
  const fallback: LocalState = {
    joinedGatherings: [],
    favoriteScriptures: [],
    visitedBuildings: [],
    totalChantingMinutes: 0,
    chantingSessionsCount: 0,
    chantingLogs: [],
    readingProgress: {},
    wishes: [],
    woodfishTotal: 0,
    offeringsCount: { bow: 0, incense: 0, lamp: 0, flower: 0 },
    pilgrimageVisited: [],
    settings: {
      defaultVolume: 0.75,
      themeMode: "light",
      animationMode: "full",
      recordRetreatLogs: true,
      defaultRetreatMinutes: 15,
      masterMuted: DEFAULT_SOUND_MIXER_STATE.masterMuted,
      soundLayers: {
        ambient: { ...DEFAULT_SOUND_MIXER_STATE.layers.ambient },
        religious: { ...DEFAULT_SOUND_MIXER_STATE.layers.religious },
        music: { ...DEFAULT_SOUND_MIXER_STATE.layers.music },
        sfx: { ...DEFAULT_SOUND_MIXER_STATE.layers.sfx },
        spatial: { ...DEFAULT_SOUND_MIXER_STATE.layers.spatial },
      },
      musicTrackId: DEFAULT_SOUND_MIXER_STATE.musicTrackId,
      roamingMode: "auto",
      roamingMotionEnabled: false,
    },
  };
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalState>;
      const parsedSettings = (parsed.settings || {}) as Partial<AppSettings>;
      return {
        ...fallback,
        ...parsed,
        offeringsCount: {
          ...fallback.offeringsCount,
          ...(parsed.offeringsCount || {}),
        },
        settings: {
          ...fallback.settings,
          ...parsedSettings,
          soundLayers: {
            ambient: {
              ...fallback.settings.soundLayers.ambient,
              ...(parsedSettings.soundLayers?.ambient || {}),
            },
            religious: {
              ...fallback.settings.soundLayers.religious,
              ...(parsedSettings.soundLayers?.religious || {}),
            },
            music: {
              ...fallback.settings.soundLayers.music,
              ...(parsedSettings.soundLayers?.music || {}),
            },
            sfx: {
              ...fallback.settings.soundLayers.sfx,
              ...(parsedSettings.soundLayers?.sfx || {}),
            },
            spatial: {
              ...fallback.settings.soundLayers.spatial,
              ...(parsedSettings.soundLayers?.spatial || {}),
            },
          },
        },
        readingProgress: parsed.readingProgress || {},
        wishes: Array.isArray(parsed.wishes) ? parsed.wishes : [],
        pilgrimageVisited: Array.isArray(parsed.pilgrimageVisited)
          ? parsed.pilgrimageVisited
          : [],
      };
    }
  } catch {
    // ignore storage errors
  }
  return fallback;
}

type ContentBundle = {
  parks: Record<ParkSlug, CulturalPark>;
  buildings: ParkBuilding[];
  scriptures: Scripture[];
  gatherings: Gathering[];
  chantingTracks: ChantingTrack[];
};

function loadCachedContent(): ContentBundle {
  try {
    const raw = localStorage.getItem(CONTENT_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ContentBundle>;
      if (parsed.parks && parsed.buildings && parsed.scriptures && parsed.gatherings) {
        return {
          parks: { ...defaultParks, ...parsed.parks },
          buildings: parsed.buildings.length ? parsed.buildings : defaultBuildings,
          scriptures: parsed.scriptures.length
            ? mergeWithAdditionalScriptures(parsed.scriptures)
            : defaultV2Scriptures,
          gatherings: parsed.gatherings.length ? parsed.gatherings : defaultGatherings,
          chantingTracks: Array.isArray(parsed.chantingTracks)
            ? parsed.chantingTracks
            : [],
        };
      }
    }
  } catch {
    // ignore cache errors
  }
  return {
    parks: defaultParks,
    buildings: defaultBuildings,
    scriptures: defaultV2Scriptures,
    gatherings: defaultGatherings,
    chantingTracks: [],
  };
}

type AppContextValue = {
  authUser: User | null;
  authReady: boolean;
  isEmailVerified: boolean;
  isAdmin: boolean;
  profile: UserProfile | null;
  joinedGatherings: string[];
  favoriteScriptures: string[];
  visitedBuildings: string[];
  totalChantingMinutes: number;
  chantingSessionsCount: number;
  chantingLogs: ChantingLogItem[];
  parks: Record<ParkSlug, CulturalPark>;
  buildings: ParkBuilding[];
  scriptures: Scripture[];
  gatherings: Gathering[];
  chantingTracks: ChantingTrack[];
  cloudSynced: boolean;
  quotaWarning: string | null;
  getPark: (slug: string) => CulturalPark | undefined;
  getBuilding: (id: string) => ParkBuilding | undefined;
  getBuildingsForPark: (slug: ParkSlug) => ParkBuilding[];
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshAuthUser: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  toggleGathering: (id: string) => Promise<void>;
  toggleFavoriteScripture: (id: string) => Promise<void>;
  markBuildingVisited: (id: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  recordChantingSession: (
    minutes: number,
    scriptureId: string,
    scriptureTitle: string,
    options?: { category?: ChantingLogItem["category"] },
  ) => Promise<void>;
  reloadCloudContent: () => Promise<void>;
  seedDefaultContentToCloud: () => Promise<void>;
  saveBuilding: (building: ParkBuilding) => Promise<void>;
  deleteBuilding: (id: string) => Promise<void>;
  saveScripture: (scripture: Scripture) => Promise<void>;
  deleteScripture: (id: string) => Promise<void>;
  saveGathering: (gathering: Gathering) => Promise<void>;
  deleteGathering: (id: string) => Promise<void>;
  saveParkIntro: (slug: ParkSlug, introduction: string) => Promise<void>;
  saveChantingTrack: (track: ChantingTrack) => Promise<void>;
  deleteChantingTrack: (id: string) => Promise<void>;
  readingProgress: Record<string, number>;
  wishes: PersonalWish[];
  woodfishTotal: number;
  offeringsCount: OfferingsCount;
  pilgrimageVisited: string[];
  settings: AppSettings;
  updateReadingProgress: (scriptureId: string, percent: number) => void;
  addPersonalWish: (realm: PersonalWish["realm"], text: string) => void;
  deletePersonalWish: (id: string) => void;
  incrementWoodfish: () => void;
  recordOffering: (kind: keyof OfferingsCount) => void;
  togglePilgrimageVisited: (siteId: string) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [localState, setLocalState] = useState<LocalState>(loadLocalState);
  const [content, setContent] = useState<ContentBundle>(loadCachedContent);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);

  const handleCloudError = useCallback(
    (error: unknown, op: OperationType, path: string, rethrow = false) => {
      if (isQuotaExceededError(error)) {
        setQuotaWarning(
          "今日云端免费读写额度已用完，已切换至本地缓存模式，明日额度恢复后可继续同步。",
        );
        return;
      }
      if (rethrow) {
        handleFirestoreError(error, op, path);
      } else {
        console.warn(`Firestore ${op} (${path}):`, error);
      }
    },
    [],
  );

  // Persist local fallback state & sync theme class
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localState));
    } catch {
      // ignore storage errors
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle(
        "dark",
        localState.settings.themeMode === "dark",
      );
      document.documentElement.setAttribute(
        "data-motion",
        localState.settings.animationMode || "full",
      );
    }
    soundManager.syncMixerState({
      masterMuted: localState.settings.masterMuted,
      layers: localState.settings.soundLayers,
      musicTrackId: localState.settings.musicTrackId,
    });
  }, [localState]);

  // Persist content cache for offline PWA
  useEffect(() => {
    try {
      localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(content));
    } catch {
      // ignore storage errors
    }
  }, [content]);

  // Load public cultural content from Firestore once on boot
  const reloadCloudContent = useCallback(async () => {
    try {
      const [
        parksSnap,
        buildingsSnap,
        scripturesSnap,
        gatheringsSnap,
        tracksSnap,
      ] = await Promise.all([
        getDocs(collection(db, "parks")),
        getDocs(collection(db, "buildings")),
        getDocs(collection(db, "scriptures")),
        getDocs(collection(db, "gatherings")),
        getDocs(collection(db, "chantingTracks")),
      ]);

      const nextParks: Record<ParkSlug, CulturalPark> = { ...defaultParks };
      parksSnap.forEach((docSnap) => {
        const data = docSnap.data() as CulturalPark;
        if (data.slug === "buddhist" || data.slug === "daoist" || data.slug === "culture") {
          nextParks[data.slug] = {
            slug: data.slug,
            title: data.title,
            englishTitle: data.englishTitle,
            identity: data.identity,
            introduction: data.introduction,
            image: data.image,
            categories: Array.isArray(data.categories) ? data.categories : defaultParks[data.slug].categories,
          };
        }
      });

      const nextBuildings: ParkBuilding[] = buildingsSnap.empty
        ? defaultBuildings
        : buildingsSnap.docs.map((d) => d.data() as ParkBuilding);

      const nextScriptures: Scripture[] = scripturesSnap.empty
        ? defaultV2Scriptures
        : mergeWithAdditionalScriptures(
            scripturesSnap.docs.map((d) => d.data() as Scripture),
          );

      const nextGatherings: Gathering[] = gatheringsSnap.empty
        ? defaultGatherings
        : gatheringsSnap.docs.map((d) => d.data() as Gathering);

      const nextTracks: ChantingTrack[] = tracksSnap.docs.map(
        (d) => d.data() as ChantingTrack,
      );

      setContent({
        parks: nextParks,
        buildings: nextBuildings,
        scriptures: nextScriptures,
        gatherings: nextGatherings,
        chantingTracks: nextTracks,
      });
      setCloudSynced(!buildingsSnap.empty || !scripturesSnap.empty || !gatheringsSnap.empty);
      setQuotaWarning(null);
    } catch (error) {
      handleCloudError(error, OperationType.LIST, "public_content", false);
    }
  }, [handleCloudError]);

  useEffect(() => {
    void (async () => {
      const status = await testConnection();
      if (status.quotaExceeded) {
        setQuotaWarning(
          "今日云端免费读写额度已用完，已切换至本地缓存模式，明日额度恢复后可继续同步。",
        );
        return;
      }
      if (status.online) {
        await reloadCloudContent();
      }
    })();
  }, [reloadCloudContent]);

  // Sync authenticated user profile & logs
  const loadUserProfile = useCallback(
    async (user: User) => {
      if (!user.emailVerified) {
        setProfile(null);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      try {
        const snap = await getDoc(userRef);
        const isOwnerAdmin = user.email === ADMIN_EMAIL;

        if (!snap.exists()) {
          const initialName = (
            user.displayName ||
            user.email?.split("@")[0] ||
            "云上行者"
          ).slice(0, 80);
          const initialEmail = (user.email || "user@example.com").slice(0, 160);
          const newProfile = {
            uid: user.uid,
            displayName: initialName,
            email: initialEmail,
            role: isOwnerAdmin ? ("admin" as const) : ("member" as const),
            totalChantingMinutes: localState.totalChantingMinutes,
            chantingSessionsCount: localState.chantingSessionsCount,
            joinedGatherings: localState.joinedGatherings.slice(0, 20),
            favoriteScriptures: localState.favoriteScriptures.slice(0, 50),
            visitedBuildings: localState.visitedBuildings.slice(0, 100),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, newProfile);
          if (isOwnerAdmin) {
            await setDoc(doc(db, "admins", user.uid), {
              email: initialEmail,
              createdAt: serverTimestamp(),
            });
          }
          setProfile({
            uid: user.uid,
            displayName: initialName,
            email: initialEmail,
            role: isOwnerAdmin ? "admin" : "member",
            totalChantingMinutes: newProfile.totalChantingMinutes,
            chantingSessionsCount: newProfile.chantingSessionsCount,
            joinedGatherings: newProfile.joinedGatherings,
            favoriteScriptures: newProfile.favoriteScriptures,
            visitedBuildings: newProfile.visitedBuildings,
          });
        } else {
          const data = snap.data() as UserProfile;
          if (isOwnerAdmin) {
            const adminRef = doc(db, "admins", user.uid);
            const adminSnap = await getDoc(adminRef);
            if (!adminSnap.exists()) {
              await setDoc(adminRef, {
                email: (user.email || ADMIN_EMAIL).slice(0, 160),
                createdAt: serverTimestamp(),
              });
            }
          }
          setProfile({
            uid: data.uid,
            displayName: data.displayName,
            email: data.email,
            role: isOwnerAdmin ? "admin" : data.role,
            totalChantingMinutes: data.totalChantingMinutes ?? 0,
            chantingSessionsCount: data.chantingSessionsCount ?? 0,
            joinedGatherings: Array.isArray(data.joinedGatherings)
              ? data.joinedGatherings
              : [],
            favoriteScriptures: Array.isArray(data.favoriteScriptures)
              ? data.favoriteScriptures
              : [],
            visitedBuildings: Array.isArray(data.visitedBuildings)
              ? data.visitedBuildings
              : [],
          });
        }

        // Load recent chanting logs
        const logsQuery = query(
          collection(db, "users", user.uid, "chantingLogs"),
          orderBy("createdAt", "desc"),
          limit(20),
        );
        const logsSnap = await getDocs(logsQuery);
        const logs: ChantingLogItem[] = logsSnap.docs.map((d) => {
          const item = d.data();
          const ts = item.createdAt?.toMillis ? item.createdAt.toMillis() : Date.now();
          const sid = String(item.scriptureId || "heart");
          const derivedCategory: ChantingLogItem["category"] = sid.startsWith(
            "retreat-buddhist-",
          )
            ? "buddhist"
            : sid.startsWith("retreat-daoist-")
              ? "daoist"
              : sid.startsWith("retreat-nature-")
                ? "nature"
                : "chanting";
          return {
            id: d.id,
            minutes: Number(item.minutes) || 0,
            scriptureId: sid,
            scriptureTitle: String(item.scriptureTitle || "静心诵读"),
            category: derivedCategory,
            createdAtMs: ts,
          };
        });
        setLocalState((prev) => ({ ...prev, chantingLogs: logs }));
      } catch (error) {
        handleCloudError(error, OperationType.GET, `users/${user.uid}`, false);
      }
    },
    [
      handleCloudError,
      localState.chantingSessionsCount,
      localState.favoriteScriptures,
      localState.joinedGatherings,
      localState.totalChantingMinutes,
      localState.visitedBuildings,
    ],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (user) {
        void loadUserProfile(user);
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, [loadUserProfile]);

  const isEmailVerified = Boolean(authUser?.emailVerified);
  const isAdmin = Boolean(
    authUser && authUser.emailVerified && authUser.email === ADMIN_EMAIL,
  );

  // Derived active user state (cloud profile when verified & loaded, else localState)
  const joinedGatherings = profile
    ? profile.joinedGatherings
    : localState.joinedGatherings;
  const favoriteScriptures = profile
    ? profile.favoriteScriptures
    : localState.favoriteScriptures;
  const visitedBuildings = profile
    ? profile.visitedBuildings
    : localState.visitedBuildings;
  const totalChantingMinutes = profile
    ? profile.totalChantingMinutes
    : localState.totalChantingMinutes;
  const chantingSessionsCount = profile
    ? profile.chantingSessionsCount
    : localState.chantingSessionsCount;

  // Auth Methods
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    await cred.user.reload();
    setAuthUser(auth.currentUser);
    if (cred.user.emailVerified) {
      await loadUserProfile(cred.user);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName?: string,
  ) => {
    const cleanEmail = email.trim();
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const name = (displayName?.trim() || cleanEmail.split("@")[0] || "云上行者").slice(
      0,
      80,
    );
    await updateProfile(cred.user, { displayName: name });
    await sendEmailVerification(cred.user);
    setAuthUser(auth.currentUser);
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshAuthUser = async () => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const updated = auth.currentUser;
    setAuthUser(updated);
    if (updated?.emailVerified) {
      await loadUserProfile(updated);
      return true;
    }
    return false;
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  // User Data Mutations
  const toggleGathering = async (id: string) => {
    const current = joinedGatherings;
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id].slice(0, 20);

    setLocalState((prev) => ({ ...prev, joinedGatherings: next }));
    if (profile && authUser?.emailVerified) {
      setProfile((prev) => (prev ? { ...prev, joinedGatherings: next } : prev));
      const path = `users/${authUser.uid}`;
      try {
        await updateDoc(doc(db, "users", authUser.uid), {
          joinedGatherings: next,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleCloudError(error, OperationType.UPDATE, path, false);
      }
    }
  };

  const toggleFavoriteScripture = async (id: string) => {
    const current = favoriteScriptures;
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id].slice(0, 50);

    setLocalState((prev) => ({ ...prev, favoriteScriptures: next }));
    if (profile && authUser?.emailVerified) {
      setProfile((prev) => (prev ? { ...prev, favoriteScriptures: next } : prev));
      const path = `users/${authUser.uid}`;
      try {
        await updateDoc(doc(db, "users", authUser.uid), {
          favoriteScriptures: next,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleCloudError(error, OperationType.UPDATE, path, false);
      }
    }
  };

  const markBuildingVisited = async (id: string) => {
    const current = visitedBuildings;
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id].slice(0, 100);

    setLocalState((prev) => ({ ...prev, visitedBuildings: next }));
    if (profile && authUser?.emailVerified) {
      setProfile((prev) => (prev ? { ...prev, visitedBuildings: next } : prev));
      const path = `users/${authUser.uid}`;
      try {
        await updateDoc(doc(db, "users", authUser.uid), {
          visitedBuildings: next,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleCloudError(error, OperationType.UPDATE, path, false);
      }
    }
  };

  const updateDisplayName = async (name: string) => {
    const cleanName = name.trim().slice(0, 80);
    if (!cleanName || !profile || !authUser?.emailVerified) return;

    setProfile((prev) => (prev ? { ...prev, displayName: cleanName } : prev));
    const path = `users/${authUser.uid}`;
    try {
      await updateDoc(doc(db, "users", authUser.uid), {
        displayName: cleanName,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleCloudError(error, OperationType.UPDATE, path, false);
    }
  };

  const recordChantingSession = async (
    minutes: number,
    scriptureId: string,
    scriptureTitle: string,
    options?: { category?: ChantingLogItem["category"] },
  ) => {
    if (localState.settings.recordRetreatLogs === false) {
      return;
    }
    const safeMinutes = Math.max(1, Math.min(180, Math.round(minutes)));
    const safeScriptureId = (scriptureId || "heart").slice(0, 80);
    const safeScriptureTitle = (scriptureTitle || "静心诵读").slice(0, 100);
    const logId = `log_${Date.now()}`;
    const inferredCategory: ChantingLogItem["category"] =
      options?.category ||
      (safeScriptureId.startsWith("retreat-buddhist-")
        ? "buddhist"
        : safeScriptureId.startsWith("retreat-daoist-")
          ? "daoist"
          : safeScriptureId.startsWith("retreat-nature-")
            ? "nature"
            : "chanting");

    const newLog: ChantingLogItem = {
      id: logId,
      minutes: safeMinutes,
      scriptureId: safeScriptureId,
      scriptureTitle: safeScriptureTitle,
      category: inferredCategory,
      createdAtMs: Date.now(),
    };

    const nextTotalMinutes = totalChantingMinutes + safeMinutes;
    const nextCount = chantingSessionsCount + 1;

    setLocalState((prev) => ({
      ...prev,
      totalChantingMinutes: nextTotalMinutes,
      chantingSessionsCount: nextCount,
      chantingLogs: [newLog, ...prev.chantingLogs].slice(0, 30),
    }));

    if (profile && authUser?.emailVerified) {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              totalChantingMinutes: nextTotalMinutes,
              chantingSessionsCount: nextCount,
            }
          : prev,
      );

      try {
        const batch = writeBatch(db);
        batch.set(doc(db, "users", authUser.uid, "chantingLogs", logId), {
          uid: authUser.uid,
          minutes: safeMinutes,
          scriptureId: safeScriptureId,
          scriptureTitle: safeScriptureTitle,
          createdAt: serverTimestamp(),
        });
        batch.update(doc(db, "users", authUser.uid), {
          totalChantingMinutes: nextTotalMinutes,
          chantingSessionsCount: nextCount,
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (error) {
        handleCloudError(
          error,
          OperationType.WRITE,
          `users/${authUser.uid}/chantingLogs`,
          false,
        );
      }
    }
  };

  // --- Admin Content Management Methods ---
  const seedDefaultContentToCloud = async () => {
    if (!isAdmin) return;
    const batch = writeBatch(db);
    Object.values(defaultParks).forEach((park) => {
      batch.set(doc(db, "parks", park.slug), {
        ...park,
        updatedAt: serverTimestamp(),
      });
    });
    defaultBuildings.forEach((b) => {
      batch.set(doc(db, "buildings", b.id), {
        ...b,
        updatedAt: serverTimestamp(),
      });
    });
    defaultScriptures.forEach((s) => {
      batch.set(doc(db, "scriptures", s.id), {
        ...s,
        updatedAt: serverTimestamp(),
      });
    });
    defaultGatherings.forEach((g) => {
      batch.set(doc(db, "gatherings", g.id), {
        ...g,
        updatedAt: serverTimestamp(),
      });
    });
    try {
      await batch.commit();
      await reloadCloudContent();
    } catch (error) {
      handleCloudError(error, OperationType.WRITE, "seed_default_content", true);
    }
  };

  const saveBuilding = async (building: ParkBuilding) => {
    if (!isAdmin) throw new Error("仅限管理员操作");
    const safeId = building.id.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 128);
    const payload: ParkBuilding = {
      id: safeId,
      parkSlug: building.parkSlug,
      title: building.title.trim().slice(0, 80),
      subtitle: building.subtitle.trim().slice(0, 120),
      description: building.description.trim().slice(0, 1500),
      scene: building.scene.trim().slice(0, 1500),
      categoryIds: building.categoryIds.slice(0, 10),
      icon: building.icon,
    };
    try {
      await setDoc(doc(db, "buildings", safeId), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      setContent((prev) => {
        const exists = prev.buildings.some((b) => b.id === safeId);
        return {
          ...prev,
          buildings: exists
            ? prev.buildings.map((b) => (b.id === safeId ? payload : b))
            : [...prev.buildings, payload],
        };
      });
    } catch (error) {
      handleCloudError(error, OperationType.WRITE, `buildings/${safeId}`, true);
    }
  };

  const deleteBuilding = async (id: string) => {
    if (!isAdmin) throw new Error("仅限管理员操作");
    try {
      await deleteDoc(doc(db, "buildings", id));
      setContent((prev) => ({
        ...prev,
        buildings: prev.buildings.filter((b) => b.id !== id),
      }));
    } catch (error) {
      handleCloudError(error, OperationType.DELETE, `buildings/${id}`, true);
    }
  };

  const saveScripture = async (scripture: Scripture) => {
    if (!isAdmin) throw new Error("仅限管理员操作");
    const safeId = scripture.id.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 128);
    const payload: Scripture = {
      id: safeId,
      title: scripture.title.trim().slice(0, 80),
      tradition: scripture.tradition.trim().slice(0, 80),
      parkSlug: scripture.parkSlug,
      description: scripture.description.trim().slice(0, 1000),
      excerpt: scripture.excerpt.trim().slice(0, 500),
      fullText: scripture.fullText.trim().slice(0, 50000),
      icon: scripture.icon,
    };
    try {
      await setDoc(doc(db, "scriptures", safeId), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      setContent((prev) => {
        const exists = prev.scriptures.some((s) => s.id === safeId);
        return {
          ...prev,
          scriptures: exists
            ? prev.scriptures.map((s) => (s.id === safeId ? payload : s))
            : [...prev.scriptures, payload],
        };
      });
    } catch (error) {
      handleCloudError(error, OperationType.WRITE, `scriptures/${safeId}`, true);
    }
  };

  const deleteScripture = async (id: string) => {
    if (!isAdmin) throw new Error("仅限管理员操作");
    try {
      await deleteDoc(doc(db, "scriptures", id));
      setContent((prev) => ({
        ...prev,
        scriptures: prev.scriptures.filter((s) => s.id !== id),
      }));
    } catch (error) {
      handleCloudError(error, OperationType.DELETE, `scriptures/${id}`, true);
    }
  };

  const saveGathering = async (gathering: Gathering) => {
    if (!isAdmin) throw new Error("仅限管理员操作");
    const safeId = gathering.id.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 128);
    const payload: Gathering = {
      id: safeId,
      day: gathering.day.trim().slice(0, 40),
      time: gathering.time.trim().slice(0, 60),
      title: gathering.title.trim().slice(0, 80),
      description: gathering.description.trim().slice(0, 500),
      icon: gathering.icon,
    };
    try {
      await setDoc(doc(db, "gatherings", safeId), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      setContent((prev) => {
        const exists = prev.gatherings.some((g) => g.id === safeId);
        return {
          ...prev,
          gatherings: exists
            ? prev.gatherings.map((g) => (g.id === safeId ? payload : g))
            : [...prev.gatherings, payload],
        };
      });
    } catch (error) {
      handleCloudError(error, OperationType.WRITE, `gatherings/${safeId}`, true);
    }
  };

  const deleteGathering = async (id: string) => {
    if (!isAdmin) throw new Error("仅限管理员操作");
    try {
      await deleteDoc(doc(db, "gatherings", id));
      setContent((prev) => ({
        ...prev,
        gatherings: prev.gatherings.filter((g) => g.id !== id),
      }));
    } catch (error) {
      handleCloudError(error, OperationType.DELETE, `gatherings/${id}`, true);
    }
  };

  const saveParkIntro = async (slug: ParkSlug, introduction: string) => {
    if (!isAdmin) throw new Error("仅限管理员操作");
    const park = content.parks[slug];
    const cleanIntro = introduction.trim().slice(0, 1000);
    try {
      await setDoc(
        doc(db, "parks", slug),
        {
          ...park,
          introduction: cleanIntro,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setContent((prev) => ({
        ...prev,
        parks: {
          ...prev.parks,
          [slug]: { ...prev.parks[slug], introduction: cleanIntro },
        },
      }));
    } catch (error) {
      handleCloudError(error, OperationType.UPDATE, `parks/${slug}`, true);
    }
  };

  const saveChantingTrack = async (track: ChantingTrack) => {
    if (!isAdmin) throw new Error("仅限管理员操作");
    const safeId = track.id.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 128);
    const cleanUrl = track.audioUrl.trim().slice(0, 1000);
    if (!cleanUrl.startsWith("https://")) {
      throw new Error("音频链接必须以 https:// 开头");
    }
    const payload: ChantingTrack = {
      id: safeId,
      title: track.title.trim().slice(0, 80),
      parkSlug: track.parkSlug,
      scriptureId: track.scriptureId.trim().slice(0, 128),
      durationLabel: (track.durationLabel.trim() || "05:00").slice(0, 40),
      audioUrl: cleanUrl,
    };
    try {
      await setDoc(doc(db, "chantingTracks", safeId), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      setContent((prev) => {
        const exists = prev.chantingTracks.some((t) => t.id === safeId);
        return {
          ...prev,
          chantingTracks: exists
            ? prev.chantingTracks.map((t) => (t.id === safeId ? payload : t))
            : [...prev.chantingTracks, payload],
        };
      });
    } catch (error) {
      handleCloudError(
        error,
        OperationType.WRITE,
        `chantingTracks/${safeId}`,
        true,
      );
    }
  };

  const deleteChantingTrack = async (id: string) => {
    if (!isAdmin) throw new Error("仅限管理员操作");
    try {
      await deleteDoc(doc(db, "chantingTracks", id));
      setContent((prev) => ({
        ...prev,
        chantingTracks: prev.chantingTracks.filter((t) => t.id !== id),
      }));
    } catch (error) {
      handleCloudError(error, OperationType.DELETE, `chantingTracks/${id}`, true);
    }
  };

  const getPark = useCallback(
    (slug: string) => {
      return Object.values(content.parks).find((park) => park.slug === slug);
    },
    [content.parks],
  );

  const getBuilding = useCallback(
    (id: string) => {
      return content.buildings.find((building) => building.id === id);
    },
    [content.buildings],
  );

  const getBuildingsForPark = useCallback(
    (slug: ParkSlug) => {
      return content.buildings.filter((building) => building.parkSlug === slug);
    },
    [content.buildings],
  );

  const updateReadingProgress = useCallback(
    (scriptureId: string, percent: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(percent)));
      setLocalState((prev) => ({
        ...prev,
        readingProgress: {
          ...prev.readingProgress,
          [scriptureId]: Math.max(prev.readingProgress[scriptureId] || 0, clamped),
        },
      }));
    },
    [],
  );

  const addPersonalWish = useCallback(
    (realm: PersonalWish["realm"], text: string) => {
      const clean = text.trim().slice(0, 300);
      if (!clean) return;
      const item: PersonalWish = {
        id: `wish_${Date.now()}`,
        realm,
        text: clean,
        createdAtMs: Date.now(),
      };
      setLocalState((prev) => ({
        ...prev,
        wishes: [item, ...prev.wishes].slice(0, 100),
      }));
    },
    [],
  );

  const deletePersonalWish = useCallback((id: string) => {
    setLocalState((prev) => ({
      ...prev,
      wishes: prev.wishes.filter((w) => w.id !== id),
    }));
  }, []);

  const incrementWoodfish = useCallback(() => {
    setLocalState((prev) => ({
      ...prev,
      woodfishTotal: prev.woodfishTotal + 1,
    }));
  }, []);

  const recordOffering = useCallback((kind: keyof OfferingsCount) => {
    setLocalState((prev) => ({
      ...prev,
      offeringsCount: {
        ...prev.offeringsCount,
        [kind]: prev.offeringsCount[kind] + 1,
      },
    }));
  }, []);

  const togglePilgrimageVisited = useCallback((siteId: string) => {
    setLocalState((prev) => {
      const exists = prev.pilgrimageVisited.includes(siteId);
      return {
        ...prev,
        pilgrimageVisited: exists
          ? prev.pilgrimageVisited.filter((id) => id !== siteId)
          : [...prev.pilgrimageVisited, siteId],
      };
    });
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setLocalState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...partial,
      },
    }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      authUser,
      authReady,
      isEmailVerified,
      isAdmin,
      profile,
      joinedGatherings,
      favoriteScriptures,
      visitedBuildings,
      totalChantingMinutes,
      chantingSessionsCount,
      chantingLogs: localState.chantingLogs,
      parks: content.parks,
      buildings: content.buildings,
      scriptures: content.scriptures,
      gatherings: content.gatherings,
      chantingTracks: content.chantingTracks,
      cloudSynced,
      quotaWarning,
      getPark,
      getBuilding,
      getBuildingsForPark,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      resendVerificationEmail,
      refreshAuthUser,
      sendPasswordReset,
      signOut,
      toggleGathering,
      toggleFavoriteScripture,
      markBuildingVisited,
      updateDisplayName,
      recordChantingSession,
      reloadCloudContent,
      seedDefaultContentToCloud,
      saveBuilding,
      deleteBuilding,
      saveScripture,
      deleteScripture,
      saveGathering,
      deleteGathering,
      saveParkIntro,
      saveChantingTrack,
      deleteChantingTrack,
      readingProgress: localState.readingProgress,
      wishes: localState.wishes,
      woodfishTotal: localState.woodfishTotal,
      offeringsCount: localState.offeringsCount,
      pilgrimageVisited: localState.pilgrimageVisited,
      settings: localState.settings,
      updateReadingProgress,
      addPersonalWish,
      deletePersonalWish,
      incrementWoodfish,
      recordOffering,
      togglePilgrimageVisited,
      updateSettings,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      authUser,
      authReady,
      isEmailVerified,
      isAdmin,
      profile,
      joinedGatherings,
      favoriteScriptures,
      visitedBuildings,
      totalChantingMinutes,
      chantingSessionsCount,
      localState,
      content,
      cloudSynced,
      quotaWarning,
      getPark,
      getBuilding,
      getBuildingsForPark,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used inside AppProvider");
  return ctx;
}
