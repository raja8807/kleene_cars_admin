import { Poppins } from 'next/font/google'

const font1 = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const FONTS = {
  font1: font1.className,
};

export default FONTS;

