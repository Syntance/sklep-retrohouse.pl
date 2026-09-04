import { redirect } from "next/navigation";
import { getSessionToken } from "@/lib/admin/session";
import { LoginForm } from "./login-form";

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const token = await getSessionToken();
	if (token) redirect("/magazyn");

	const { error } = await searchParams;

	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-12">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<p className="text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
						RetroHouse
					</p>
					<h1 className="mt-2 font-serif text-2xl text-foreground">Panel magazynu</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Zaloguj się, aby zarządzać produktami i kategoriami.
					</p>
				</div>

				<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
					<LoginForm googleError={error === "google"} forbidden={error === "forbidden"} />
				</div>
			</div>
		</main>
	);
}
