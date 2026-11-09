import {Moon, Sun} from "lucide-react"

import {useTheme} from "@/components/theme-provider"
import {Avatar, AvatarFallback} from "@/components/ui/avatar"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {useProfile} from "@/features/profile/hooks/use-profile"

function initials(firstName: string, lastName: string) {
    return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()
}

export function ProfilePage() {
    const profile = useProfile()
    const {theme, setTheme} = useTheme()

    if (profile.loading) {
        return (
            <main className="p-4 sm:p-6">
                <div className="mx-auto max-w-3xl text-sm text-muted-foreground" role="status">
                    Loading profile...
                </div>
            </main>
        )
    }

    if (profile.error || !profile.user) {
        return (
            <main className="p-4 sm:p-6">
                <div className="mx-auto max-w-3xl space-y-3">
                    <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
                    <p className="text-sm text-destructive">
                        We couldn&apos;t load your profile.
                    </p>
                    <Button onClick={() => void profile.retry()} variant="outline">
                        Try again
                    </Button>
                </div>
            </main>
        )
    }

    const {user} = profile

    return (
        <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
            <div className="mx-auto max-w-3xl space-y-6">
                <header>
                    <p className="text-xs font-medium tracking-widest text-primary uppercase">
                        Account
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">Profile</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        View your account information and appearance preferences.
                    </p>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal information</CardTitle>
                        <CardDescription>Your account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <Avatar size="lg" aria-label={`${user.firstName} ${user.lastName}`}>
                            <AvatarFallback>{initials(user.firstName, user.lastName)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Theme</CardTitle>
                        <CardDescription>Choose how Omen looks on this device.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                        <Button
                            aria-pressed={theme === "light"}
                            onClick={() => setTheme("light")}
                            variant={theme === "light" ? "default" : "outline"}
                        >
                            <Sun/>
                            Light
                        </Button>
                        <Button
                            aria-pressed={theme === "dark"}
                            onClick={() => setTheme("dark")}
                            variant={theme === "dark" ? "default" : "outline"}
                        >
                            <Moon/>
                            Dark
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
