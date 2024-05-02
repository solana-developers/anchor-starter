import WalletMultiButton from "./wallet-multi-button";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import SolanaLogo from "../public/solanaLogo.svg";

export function NavBar() {
  return (
    <Navbar maxWidth="md">
      <NavbarBrand>
        <Image src={SolanaLogo} alt="Solana Logo" width={100} />
      </NavbarBrand>
      <NavbarContent justify="end">
        <Tooltip placement="bottom" content="Devnet Only">
          <NavbarItem>
            <WalletMultiButton />
          </NavbarItem>
        </Tooltip>
      </NavbarContent>
    </Navbar>
  );
}
