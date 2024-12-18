import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter, useSearchParams } from 'next/navigation'
import { useContext } from 'use-context-selector'
import Button from '@/app/components/base/button'
import Toast from '@/app/components/base/toast'
import { emailRegex } from '@/config'
import { login } from '@/service/common'
import Input from '@/app/components/base/input'
import I18NContext from '@/context/i18n'

type MailAndPasswordAuthProps = {
  isInvite: boolean
  allowRegistration: boolean
}

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/

export default function MailAndPasswordAuth({ isInvite, allowRegistration }: MailAndPasswordAuthProps) {
  const { t } = useTranslation()
  const { locale } = useContext(I18NContext)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const emailFromLink = decodeURIComponent(searchParams.get('email') || '')
  const accountFromLink = decodeURIComponent(searchParams.get('account') || '')
  const mobileFromLink = decodeURIComponent(searchParams.get('mobile') || '')
  const codeFromLink = decodeURIComponent(searchParams.get('code') || '')
  const passwordFromLink = decodeURIComponent(searchParams.get('password') || '')
  const [account, setAccount] = useState(accountFromLink)
  const [code, setCode] = useState(codeFromLink)
  const [mobile, setMobile] = useState(mobileFromLink)
  const [email, setEmail] = useState(emailFromLink)
  const [password, setPassword] = useState(passwordFromLink)

  const [isLoading, setIsLoading] = useState(false)

  // 使用 useState 来管理状态
  const [num, setNum] = useState(1);

  // 处理点击事件
  const handleClick = (number: number) => {
    setNum(number);
  };

  const handleEmailPasswordLogin = async () => {
    if (!email) {
      Toast.notify({ type: 'error', message: t('login.error.emailEmpty') })
      return
    }
    if (!emailRegex.test(email)) {
      Toast.notify({
        type: 'error',
        message: t('login.error.emailInValid'),
      })
      return
    }
    if (!password?.trim()) {
      Toast.notify({ type: 'error', message: t('login.error.passwordEmpty') })
      return
    }
    if (!passwordRegex.test(password)) {
      Toast.notify({
        type: 'error',
        message: t('login.error.passwordInvalid'),
      })
      return
    }
    try {
      setIsLoading(true)
      const loginData: Record<string, any> = {
        email,
        password,
        language: locale,
        remember_me: true,
      }
      if (isInvite)
        loginData.invite_token = decodeURIComponent(searchParams.get('invite_token') as string)
      const res = await login({
        url: '/login',
        body: loginData,
      })
      if (res.result === 'success') {
        if (isInvite) {
          router.replace(`/signin/invite-settings?${searchParams.toString()}`)
        }
        else {
          localStorage.setItem('console_token', res.data.access_token)
          localStorage.setItem('refresh_token', res.data.refresh_token)
          router.replace('/apps')
        }
      }
      else if (res.code === 'account_not_found') {
        if (allowRegistration) {
          const params = new URLSearchParams()
          params.append('email', encodeURIComponent(email))
          params.append('token', encodeURIComponent(res.data))
          router.replace(`/reset-password/check-code?${params.toString()}`)
        }
        else {
          Toast.notify({
            type: 'error',
            message: t('login.error.registrationNotAllowed'),
          })
        }
      }
      else {
        Toast.notify({
          type: 'error',
          message: res.data,
        })
      }
    }

    finally {
      setIsLoading(false)
    }
  }

  /**
   * 这里是邮箱+密码登录 => 手机号+验证码
   */
  return <form onSubmit={() => { }}>

    <div className="tab_con">

      <div className="tab_btns">
        <input
          type='button'
          className={`system-md-regular ${num === 1 ? 'active' : ''}`} 
          value="手机号登录" 
          onClick={() => handleClick(1)} 
        />
        <input
          type='button'
          className={`system-md-regular ${num === 2 ? 'active' : ''}`} 
          value="账号登录" 
          onClick={() => handleClick(2)} 
        />
      </div>

      {
        num === 1 && (
          <>
            {/* 邮箱 */}
            {/* <div className='mb-3'>
              <label htmlFor="email" className="my-2 system-md-semibold text-text-secondary">
                {t('login.email')}
              </label>
              <div className="mt-1">
                <Input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isInvite}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('login.emailPlaceholder') || ''}
                  tabIndex={1}
                />
              </div>
            </div> */}
            <div className='mb-3'>
              <div className="mt-1">
                <Input
                  id='mobile'
                  className='border-grey input-resize'
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  disabled={isInvite}
                  type="mobile"
                  autoComplete="mobile"
                  placeholder={t('login.mobilePlaceholder') || ''}
                  tabIndex={1}
                />
              </div>
            </div>
            {/* 验证码 */}
            <div className='mb-3'>
              {/* <label htmlFor="password" className="my-2 flex items-center justify-between">
                <span className='system-md-semibold text-text-secondary'>{t('login.password')}</span>
                <Link href={`/reset-password?${searchParams.toString()}`} className='system-xs-regular text-components-button-secondary-accent-text'>
                  {t('login.forget')}
                </Link>
              </label> */}
              <div className="codeBox relative mt-1">
                {/* <Input
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter')
                      handleEmailPasswordLogin()
                  }}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={t('login.passwordPlaceholder') || ''}
                  tabIndex={2}
                /> */}
                <Input
                  id='code'
                  className='border-grey input-resize'
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder={t('login.codePlaceholder') || ''}
                  tabIndex={2}
                />
                <div className="divide absolute"></div>
                <div className="absolute inset-y-0 right-2 flex items-center system-md-regular login-btn">
                  获取验证码
                </div>
                {/* <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    type="button"
                    variant='ghost'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👀' : '😝'}
                  </Button>
                </div> */}
              </div>
            </div>

            {/* 协议 */}
            <div className="w-full mt-16 mb-8 system-xs-regular flex flex-row justify-center items-center">
              <input 
                className='mr-2'
                type="checkbox"
                onChange={(e) => console.log(e.target.checked)} 
              />
              {t('login.tosDesc')}
              &nbsp;
              <Link
                className='link-color system-xs-medium text-text-secondary hover:underline' // 这里可以用样式表中的text-accent
                target='_blank' rel='noopener noreferrer'
                href='https://dify.ai/terms'
              >《 {t('login.tos')} 》</Link>
              &nbsp;和&nbsp;
              <Link
                className='link-color system-xs-medium text-text-secondary hover:underline'
                target='_blank' rel='noopener noreferrer'
                href='https://dify.ai/privacy'
              >《 {t('login.pp')} 》</Link>
            </div>

            {/* 登录按钮 */}
            <div className='mb-2'>
              <Button
                tabIndex={2}
                variant='primary'
                onClick={handleEmailPasswordLogin}
                // disabled={isLoading || !email || !password}
                className="w-full input-resize"
              >{t('login.signBtn')}</Button>
            </div>

            {/* tip */}
            <div className='system-xs-medium mt-4 text-text-tertiary'>登录即自动创建账号</div>
          </>
        )
      }

      {
        num === 2 && (
          <>
            {/* 账号 */}
            <div className='mb-3'>
              <div className="mt-1">
                <Input
                  id='account'
                  className='border-grey input-resize'
                  value={account}
                  type="account"
                  autoComplete="account"
                  placeholder={t('login.accountPlaceholder') || ''}
                  tabIndex={2}
                />
              </div>
            </div>
            {/* 密码 */}
            <div className='mb-3'>
              <div className="mt-1">
                <Input
                  id='password'
                  className='border-grey input-resize'
                  value={password}
                  type="password"
                  autoComplete="password"
                  placeholder={t('login.passwordPlaceholder') || ''}
                  tabIndex={2}
                />
              </div>
            </div>
            {/* 登录按钮 */}
            <div className='mb-2 mt-20'>
              <Button
                tabIndex={2}
                variant='primary'
                // disabled={isLoading || !email || !password}
                className="w-full input-resize"
              >{t('login.signBtn')}</Button>
            </div>
          </>
        )
      }

    </div>
  </form>
}
