import { Navbar } from "~/components/UI";

export default function Header(props) {
  return (
    <Navbar className='bg-base-200 shadow-md'>
      <h1>Backoff<span className='font-light text-white/90'> Calculator</span></h1>
    </Navbar>
  );
}
