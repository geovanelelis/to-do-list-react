'use client'

import Button from '@/components/button'
import { signIn } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import {
  FaGoogle,
  FaGithub,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserPlus,
  FaSignInAlt,
} from 'react-icons/fa'
import { BsStars } from 'react-icons/bs'
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { setDoc, doc } from 'firebase/firestore'
import { auth, db } from '@/services/firebaseConnection'
import { showAlert } from '@/components/alert'
import Loading from '@/components/loading'

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mode, setMode] = useState('login')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMode(searchParams.get('mode') || 'login')
  }, [searchParams])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    if (!firstName || !lastName || !email || !password) {
      showAlert('error', 'Preencha todos os campos.')
      setIsLoading(false)
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
      setIsLoading(false)
    }
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    if (!email || !password) {
      showAlert('error', 'Preencha todos os campos.')
      setIsLoading(false)
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
      setIsLoading(false)
    }
  }

  return (
    <div className="px-4 py-8">
      <Head>
        <title>Tarefinhas - {mode === 'login' ? 'Entrar' : 'Criar Conta'}</title>
      </Head>

      <main>
        <div className="w-full min-h-screen flex items-center justify-center xl:justify-evenly max-xl:flex-col gap-8 xl:gap-12">
          {/* Logo */}
          <div className="flex flex-col items-center gap-6 max-w-2xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-indigo-600/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gray-600/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
                <Image
                  src="/logocompleta.png"
                  alt="Logo Tarefinhas"
                  width={600}
                  height={600}
                  className="w-full max-w-[480px] xl:max-w-[600px] h-auto"
                />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl xl:text-3xl font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-indigo-600 bg-clip-text text-transparent">
                O MELHOR SISTEMA PARA
              </h1>
              <h2 className="text-xl xl:text-2xl font-bold bg-gradient-to-r from-indigo-500 to-primary-400 bg-clip-text text-transparent">
                ORGANIZAR SUAS TAREFAS
              </h2>
            </div>
          </div>

          {/* Formulário de Autenticação */}
          <div className="w-full max-w-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-blue-600/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-gray-600/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-xl">
                      <BsStars className="text-xl text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-indigo-500 bg-clip-text text-transparent">
                      {mode === 'login' ? 'Bem-vindo(a)!' : 'Crie sua conta'}
                    </h1>
                  </div>
                  <p className="text-gray-300 font-light">
                    {mode === 'login'
                      ? 'Entre com sua conta e organize suas tarefas.'
                      : 'É rápido e fácil. Comece agora!'}
                  </p>
                </div>

                {/* Formulário */}
                <form
                  className="space-y-4 mb-6"
                  onSubmit={mode === 'login' ? handleLogin : handleRegister}
                >
                  {mode !== 'login' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400 text-sm" />
                        </div>
                        <input
                          type="text"
                          placeholder="Nome"
                          className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400 text-sm" />
                        </div>
                        <input
                          type="text"
                          placeholder="Sobrenome"
                          className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400 text-sm" />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400 text-sm" />
                    </div>
                    <input
                      type="password"
                      placeholder="Senha"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        {mode === 'login' ? <FaSignInAlt /> : <FaUserPlus />}
                        {mode === 'login' ? 'Entrar' : 'Cadastrar'}
                      </>
                    )}
                  </Button>
                </form>

                {/* Toogle para login/cadastro */}
                <div className="text-center mb-6">
                  <p className="text-gray-300 text-sm">
                    {mode === 'login' ? (
                      <>
                        Não tem uma conta?{' '}
                        <button
                          onClick={() => router.push('/auth?mode=register')}
                          className="text-primary-400 hover:text-primary-300 transition-colors duration-300 cursor-pointer font-medium"
                        >
                          Criar conta
                        </button>
                      </>
                    ) : (
                      <>
                        Já tem uma conta?{' '}
                        <button
                          onClick={() => router.push('/auth?mode=login')}
                          className="text-primary-400 hover:text-primary-300 transition-colors duration-300 cursor-pointer font-medium"
                        >
                          Entrar
                        </button>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <hr className="flex-1 border-white/20" />
                  <p className="text-gray-400 text-sm">ou</p>
                  <hr className="flex-1 border-white/20" />
                </div>

                {/* Login Social */}
                <div className="flex items-center justify-center gap-4 w-full">
                  <Button
                    onClick={() => signIn('google')}
                    className="group flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl py-3 px-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <FaGoogle className="text-lg text-red-400 group-hover:text-red-300 transition-colors duration-300" />
                    <span className="text-white font-medium">Google</span>
                  </Button>
                  <Button
                    onClick={() => signIn('github')}
                    className="group flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl py-3 px-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <FaGithub className="text-lg text-gray-300 group-hover:text-white transition-colors duration-300" />
                    <span className="text-white font-medium">GitHub</span>
                  </Button>
                </div>
              </div>
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
