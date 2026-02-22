import Image from "next/image";
import Link from "next/link";

import { FcGoogle } from "react-icons/fc";

import { Background } from "@/components/background";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const Login = () => {
  return (
    <Background variant="dots">
      <section className="py-28 lg:pt-44 lg:pb-32 min-h-screen flex items-center justify-center">
        <div className="container">
          <Reveal direction="up" delay={0.1}>
            <div className="flex flex-col gap-4">
              <Card className="mx-auto w-full max-w-sm border-none shadow-2xl rounded-[2rem] bg-background/40 backdrop-blur-xl border-t border-white/20 p-4">
                <CardHeader className="flex flex-col items-center space-y-0 p-8 pb-4">
                  <Image
                    src="/logo.svg"
                    alt="logo"
                    width={120}
                    height={24}
                    className="mb-8 dark:invert"
                  />
                  <p className="mb-2 text-2xl font-black italic uppercase tracking-tighter">Welcome back</p>
                  <p className="text-muted-foreground text-sm font-medium tracking-tight">
                    Please enter your details to continue.
                  </p>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <div className="grid gap-5">
                    <Input type="email" placeholder="Enter your email" required className="h-12 rounded-xl bg-background/50" />
                    <div>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        required
                        className="h-12 rounded-xl bg-background/50"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          className="border-muted-foreground rounded-md"
                        />
                        <label
                          htmlFor="remember"
                          className="text-xs font-bold text-muted-foreground cursor-pointer"
                        >
                          Remember me
                        </label>
                      </div>
                      <a href="#" className="text-primary text-xs font-bold hover:underline italic">
                        Forgot password?
                      </a>
                    </div>
                    <Button type="submit" className="mt-2 w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20">
                      Login to Workshop
                    </Button>
                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-muted/50" /></div>
                      <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-transparent px-2 text-muted-foreground/40">Or continue with</span></div>
                    </div>
                    <Button variant="outline" className="w-full h-12 rounded-xl border-2 font-bold hover:bg-background">
                      <FcGoogle className="mr-2 size-5" />
                      Sign in with Google
                    </Button>
                  </div>
                  <div className="text-muted-foreground mx-auto mt-8 flex justify-center gap-1 text-sm font-medium">
                    <p>Don&apos;t have an account?</p>
                    <Link href="/signup" className="text-primary font-black italic hover:underline">
                      Sign up
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Reveal>
        </div>
      </section>
    </Background>
  );
};

export default Login;
