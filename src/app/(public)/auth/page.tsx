'use client'

import Button from '@/components/button'
import { signIn } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { FaGoogle, FaGithub } from 'react-icons/fa'
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { setDoc, doc } from 'firebase/firestore'
import { auth, db } from '@/services/firebaseConnection'
import { showAlert } from '@/components/alert'
import Loading from '@/components/loading'
import Link from 'next/link'

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mode, setMode] = useState('login')

  useEffect(() => {
    setMode(searchParams.get('mode') || 'login')
  }, [searchParams])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault()

    if (!firstName || !lastName || !email || !password) {
      showAlert('error', 'Preencha todos os campos.')
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      })

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        createdAt: new Date(),
      })

      showAlert('success', 'Conta criada com sucesso!')
      router.push('/')
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        showAlert('error', 'O email já está em uso.')
      } else if (error.code === 'auth/invalid-email') {
        showAlert('error', 'Email inválido.')
      } else if (error.code === 'auth/weak-password') {
        showAlert('error', 'Senha muito fraca.')
      } else {
        showAlert('error', 'Erro ao criar conta.')
      }
    } finally {
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
    }
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    if (!email || !password) {
      showAlert('error', 'Preencha todos os campos.')
      return
    }
    try {
      const userCredentials = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredentials.user

      const result = await signIn('credentials', {
        redirect: false,
        email: user.email,
        password: password,
      })

      if (!result?.error) {
        router.push('/')
      } else {
        showAlert('error', 'Erro ao autenticar com NextAuth.')
      }
    } catch (error: any) {
      showAlert('error', 'Email ou senha inválidos.')
    } finally {
      setEmail('')
      setPassword('')
    }
  }

  return (
    <div>
      <Head>
        <title>Tarefinhas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <main className="w-full mx-auto">
        <div className="min-h-[100dvh] flex items-center justify-center flex-col gap-8 overflow-hidden px-4 py-4 sm:py-0">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-5 w-full items-center justify-center">
              <Image
                src="/logotarefinhas.png"
                alt="Logo Tarefinhas"
                width={120}
                height={120}
                className="w-20 max-w-full"
              />
              <h1 className="flex text-6xl sm:text-7xl font-heading font-black text-gray-300 relative top-3.5 sm:top-4">
                Tarefinhas
              </h1>
            </div>
            <h1 className="hidden sm:flex text-gray-300 w-full max-w-[540px] sm:w-full font-sans leading-6 items-center justify-center text-center font-medium text-sm sm:text-base">
              O MELHOR SISTEMA PARA ORGANIZAR SUAS TAREFAS
            </h1>
          </div>

          <div className="bg-gray-900 w-full max-w-[540px] rounded-2xl text-gray-200 border border-gray-700 p-6 sm:p-10 flex items-center justify-center flex-col gap-6">
            <span className="text-center">
              <h1 className="text-4xl text-gray-200 font-black mb-1">
                {mode === 'login' ? 'Login' : 'Crie sua conta'}
              </h1>
              <p className="">{mode === 'login' ? 'Entre com sua conta.' : 'É rápido e fácil.'}</p>
            </span>

            <form
              action={''}
              className="flex flex-col gap-2.5 w-full"
              onSubmit={mode === 'login' ? handleLogin : handleRegister}
            >
              {mode !== 'login' && (
                <>
                  <span className="flex gap-2.5 w-full max-sm:flex-col">
                    <input
                      type="text"
                      placeholder="Nome"
                      className="text-sm bg-gray-800 rounded-xl px-3 py-3 w-full focus:outline-none focus:ring focus:ring-primary-700"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Sobrenome"
                      className="text-sm bg-gray-800 rounded-xl px-3 py-3 w-full focus:outline-none focus:ring focus:ring-primary-700"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </span>
                </>
              )}
              <input
                type="email"
                placeholder="Email"
                className="text-sm bg-gray-800 rounded-xl px-3 py-3 w-full focus:outline-none focus:ring focus:ring-primary-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Senha"
                className="text-sm bg-gray-800 rounded-xl px-3 py-3 w-full focus:outline-none focus:ring focus:ring-primary-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                className="bg-primary-700 text-gray-100 py-2 mt-4 hover:bg-primary-500 rounded-xl"
              >
                {mode === 'login' ? 'Entrar' : 'Cradastrar'}
              </Button>
            </form>

            <p className="text-sm">
              {mode === 'login' ? (
                <>
                  Não tem uma conta?{' '}
                  <Link
                    href={'/auth?mode=register'}
                    className="text-primary-700 hover:text-primary-500 transition-colors duration-300 cursor-pointer"
                  >
                    Criar conta
                  </Link>
                </>
              ) : (
                <>
                  Já tem uma conta?{' '}
                  <Link
                    href={'/auth?mode=login'}
                    className="text-primary-700 hover:text-primary-500 transition-colors duration-300 cursor-pointer"
                  >
                    Entrar
                  </Link>
                </>
              )}
            </p>

            <div className="flex items-center justify-center gap-2 w-full">
              <hr className="text-gray-600 w-full" />
              <p>ou</p>
              <hr className="text-gray-600 w-full" />
            </div>

            <div className="flex items-center justify-center gap-6 w-full">
              <Button
                onClick={() => signIn('google')}
                className="px-3.5 py-3.5 bg-gray-700 rounded-full hover:bg-gray-800"
              >
                <FaGoogle className="size-6 text-primary-500 hover:text-primary-700 transition-colors duration-300" />
              </Button>
              <Button
                onClick={() => signIn('github')}
                className="px-3.5 py-3.5 bg-gray-700 rounded-full hover:bg-gray-800"
              >
                {' '}
                <FaGithub className="size-6 text-primary-500 hover:text-primary-700 transition-colors duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthContent />
    </Suspense>
  )
}
