import React from 'react'
import { signUpAction } from '../actions/auth'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'

const SignupPage =  () => {
  return (
    <div>
        <h1>
            <form className='flex flex-col gap-4 w-64' action={signUpAction}>
                <Input type='text' name='name' placeholder='Name' />
                <Input type='email' name='email' placeholder='Email' />
                <Input type='password' name='password' placeholder='Password' />
                <Button type='submit'>Sign Up</Button>
            </form>
        </h1>
    </div>
  )
}

export default SignupPage