import { Navbar } from "~/components/UI";

export default function Header(props) {
  return (
    <Navbar className='bg-base-200 shadow-md'>
      <h1>{__APP_TITLE__}</h1>
    </Navbar>
  );
}
