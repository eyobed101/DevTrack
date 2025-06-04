'use client'
import Link from "next/link"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import toast from "react-hot-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [user, setUser] = useState({
    email: "",
    password: "",
    username: "",
  })

  const [loading, setLoading] = useState(false)

  const onSignup = async () => {
    try {
      setLoading(true)
      await axios.post("/api/users/signup", user)
      toast.success("Signup successful")
      toast("Please check your inbox and click on verification link.", { 
        duration: 10000,
        icon: '✉️',
        style: {
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          color: '#0c4a6e',
        }
      })
      router.push("/login")
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = user.username.length > 0 && 
                      user.email.length > 0 && 
                      user.password.length > 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-xl overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <CardTitle className="text-2xl font-bold text-primary-foreground">
            Create Account
          </CardTitle>
          <CardDescription className="text-primary-foreground/80 mt-1">
            Join our community today
          </CardDescription>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Your unique name"
                value={user.username}
                onChange={(e) => setUser({...user, username: e.target.value})}
                className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={user.email}
                onChange={(e) => setUser({...user, email: e.target.value})}
                className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={user.password}
                onChange={(e) => setUser({...user, password: e.target.value})}
                className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>
          
          <Button
            disabled={!isFormValid || loading}
            onClick={onSignup}
            className="w-full h-11 transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Create Account"
            )}
          </Button>
        </CardContent>
        
        <CardFooter className="p-6 pt-0">
          <div className="w-full text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link 
              href='/login'
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}