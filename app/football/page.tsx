'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export default function FootballWaitlistPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSubmitted(true);
        setIsLoading(false);
        setEmail('');
    };

    return (
        <div className="min-h-screen bg-background text-foreground dark">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-background to-blue-900/20" />

            <div className="relative z-10 container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
                    {/* Left side - Content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm text-green-400 font-medium">Coming Soon</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent leading-tight">
                                Football Fantasy{" "}
                                <span className="text-green-400">AI</span>
                            </h1>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">What to expect:</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex flex-col items-center gap-2 border p-2">
                                    <Image
                                        src={'/ai.webp'}
                                        width={80}
                                        height={80}
                                        alt={'AI'}
                                    />
                                    <div className="text-center">
                                        <p className="text-xs text-foreground uppercase">AI-Based predictions</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2 border p-2">
                                    <Image
                                        src={'/analytics.webp'}
                                        width={80}
                                        height={80}
                                        alt={'Analytics'}
                                    />
                                    <div className="text-center">
                                        <p className="text-xs text-foreground uppercase text-balance">Advanced Analytics</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2 border p-2">
                                    <Image
                                        src={'/realtime.webp'}
                                        width={80}
                                        height={80}
                                        alt={'Real-time'}
                                    />
                                    <div className="text-center">
                                        <p className="text-xs text-foreground uppercase text-balance">Real-time Match Data</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2 border p-2">
                                    <Image
                                        src={'/team.webp'}
                                        width={80}
                                        height={80}
                                        alt={'Team'}
                                    />
                                    <div className="text-center">
                                        <p className="text-xs text-foreground uppercase text-balance">Team Formation Suggestions</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Email form */}
                        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                            {!isSubmitted ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex gap-3">
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="flex-1"
                                                disabled={isLoading}
                                            />
                                            <Button
                                                type="submit"
                                                disabled={isLoading || !email}
                                                className="px-6"
                                            >
                                                {isLoading ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        Joining...
                                                    </div>
                                                ) : (
                                                    'Join Waitlist'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        We&apos;ll notify you as soon as football predictions are available. No spam, promise! 🤝
                                    </p>
                                </form>
                            ) : (
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">You&apos;re on the list! ⚽</h3>
                                    <p className="text-muted-foreground">
                                        Thanks for joining! We&apos;ll email you as soon as football predictions are ready.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsSubmitted(false)}
                                        className="mt-4"
                                    >
                                        Add another email
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="flex items-center justify-center max-md:hidden">
                        <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl scale-150" />

                            {/* 3D Football Animation */}
                            <div className="relative w-80 h-80 perspective-1000">
                                <div className="w-full h-full">
                                    <div className="absolute inset-0 rounded-full">
                                        <Image
                                            src={'/football.webp'}
                                            fill
                                            alt='football'
                                            className='absolute inset-0 scale-150 animate-bounce'
                                        />
                                        {/* Back hemisphere shadow */}
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-black/30 via-transparent to-transparent transform animate-bounce" />

                                        {/* Bottom shadow */}
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-32 h-8 bg-black/20 rounded-full blur-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-8 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                        Powered by <span className="text-green-400 font-semibold">Cream11</span> •
                        Advanced AI predictions for fantasy sports
                    </p>
                </div>
            </div>
        </div>
    );
}