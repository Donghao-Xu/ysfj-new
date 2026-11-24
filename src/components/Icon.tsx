import {
  Award,
  Book,
  BookOpen,
  Circle,
  Columns3,
  Compass,
  Edit3,
  Heart,
  Home,
  Layers,
  MessageCircle,
  Music,
  Star,
  Sun,
  Sunrise,
  User,
  Users,
  Wind,
} from "lucide-react";
import type { CultureIcon } from "@/data/parks";

export function CulturalIcon({
  name,
  size = 18,
  className = "",
}: {
  name: CultureIcon;
  size?: number;
  className?: string;
}) {
  const props = { size, className, strokeWidth: 1.9 };
  switch (name) {
    case "home":
      return <Home {...props} />;
    case "book-open":
      return <BookOpen {...props} />;
    case "circle":
      return <Circle {...props} />;
    case "columns":
      return <Columns3 {...props} />;
    case "wind":
      return <Wind {...props} />;
    case "sun":
      return <Sun {...props} />;
    case "message-circle":
      return <MessageCircle {...props} />;
    case "book":
      return <Book {...props} />;
    case "edit-3":
      return <Edit3 {...props} />;
    case "users":
      return <Users {...props} />;
    case "heart":
      return <Heart {...props} />;
    case "star":
      return <Star {...props} />;
    case "award":
      return <Award {...props} />;
    case "music":
      return <Music {...props} />;
    case "sunrise":
      return <Sunrise {...props} />;
    case "user":
      return <User {...props} />;
    case "compass":
      return <Compass {...props} />;
    case "layers":
      return <Layers {...props} />;
    default:
      return <Sun {...props} />;
  }
}
