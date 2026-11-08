import {Link} from "react-router"

export default function NotFoundPage() {
    return (
        <main className="grid min-h-[calc(100vh-3rem)] place-items-center bg-background p-6 text-foreground">
            <div className="text-center">
                <h1 className="text-3xl font-semibold">Page not found</h1>

                <p className="mt-2 text-muted-foreground">
                    The requested page does not exist.
                </p>

                <Link className="mt-4 inline-block underline" to="/">
                    Return home
                </Link>
            </div>
        </main>
    )
}
