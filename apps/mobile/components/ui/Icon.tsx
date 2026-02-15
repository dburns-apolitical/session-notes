import * as icons from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { StyleProp, ViewStyle } from "react-native";

export type IconName = keyof typeof icons;

export function Icon({
  name,
  size = 24,
  color = "#000",
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const LucideIcon = icons[name] as LucideIcon;
  return <LucideIcon size={size} color={color} style={style} />;
}
