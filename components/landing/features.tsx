import { Card, CardContent } from '@/components/ui/card'
import { Brain, Target, TrendingUp, Users } from 'lucide-react'

export function Features() {
    return (
        <section className="bg-background py-16 md:py-32">
            <div className="mx-auto max-w-3xl lg:max-w-5xl px-6">
                <div className="relative">
                    <div className="relative z-10 grid grid-cols-6 gap-3">
                        <Card className="relative col-span-full flex overflow-hidden lg:col-span-3">
                            <CardContent className="relative grid place-items-center m-auto size-fit pt-6">
                                <div className="relative flex h-24 w-56 items-center">
                                    <Brain className="mx-auto h-16 w-16 text-primary" />
                                </div>
                                <h2 className="mt-6 text-center text-3xl font-semibold">AI Powered</h2>
                                <p className="mt-2 text-center text-muted-foreground">Advanced algorithms analyze player performance and predict optimal team combinations</p>
                            </CardContent>
                        </Card>
                        <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-3">
                            <CardContent className="pt-6">
                                <div className="relative mx-auto flex aspect-square size-32 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                                    <TrendingUp className="m-auto h-16 w-16 text-primary" />
                                </div>
                                <div className="relative z-10 mt-6 space-y-2 text-center">
                                    <h2 className="group-hover:text-secondary-950 text-lg font-medium transition dark:text-white">Real-time Analytics</h2>
                                    <p className="text-foreground">Live match data and player statistics to make informed decisions during gameplay</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-3">
                            <CardContent className="pt-6">
                                <div className="relative mx-auto flex aspect-square size-32 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                                    <Target className="m-auto h-16 w-16 text-primary" />
                                </div>
                                <div className="relative z-10 mt-6 space-y-2 text-center">
                                    <h2 className="group-hover:text-secondary-950 text-lg font-medium transition dark:text-white">Strategic Insights</h2>
                                    <p className="text-foreground">Get detailed match analysis and player recommendations to maximize your team's potential</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="relative col-span-full overflow-hidden lg:col-span-3">
                            <CardContent className="pt-6">
                                <div className="relative mx-auto flex aspect-square size-32 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                                    <Users className="m-auto h-16 w-16 text-primary" />
                                </div>
                                <div className="relative z-10 mt-6 space-y-2 text-center">
                                    <h2 className="group-hover:text-secondary-950 text-lg font-medium transition dark:text-white">Team Builder</h2>
                                    <p className="text-foreground">Build winning fantasy teams with our intelligent player selection and budget optimization tools</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}
