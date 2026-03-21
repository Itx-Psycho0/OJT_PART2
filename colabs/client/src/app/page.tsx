import React from 'react'
import Link from 'next/link'

const page = () => {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      click  <Link href='/documents/1234'><span className='text-blue-500 underline'>&nbsp; here &nbsp;</span></Link> to go to documents
      
    </div>
  )
}

export default page
