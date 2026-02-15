import * as LucideIcons from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { StyleProp, ViewStyle } from "react-native";

type IconComponents = {
  [K in keyof typeof LucideIcons]: (typeof LucideIcons)[K] extends LucideIcon ? K : never;
};
type IconKeys = IconComponents[keyof typeof LucideIcons];

export type IconName = IconKeys & string;

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
  const LucideIcon = LucideIcons[name] as LucideIcon;
  return <LucideIcon size={size} color={color} style={style} />;
}
