import { redirect } from "next/navigation";
import { SETTINGS_BASE_PATH } from "@/lib/content/metadata-keys";

export default function UstawieniaIndexPage() {
	redirect(`${SETTINGS_BASE_PATH}/ogolne`);
}
