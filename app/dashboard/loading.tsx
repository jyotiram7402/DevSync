import { SectionsPageSkeleton } from "@/components/shared/page-skeletons";

/** Fallback for app pages without their own skeleton (Settings, Profile, Help…). */
export default function Loading() {
  return <SectionsPageSkeleton />;
}
