import {
  Box,
  Button,
  Flex,
  Spacer,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import WalletMultiButton from "@/components/WalletMultiButton";
import { useWallet } from "@solana/wallet-adapter-react";
import CounterState from "@/components/CounterState";
import IncrementButton from "@/components/IncrementButton";
import QrModal from "@/components/SolanaPay";

export default function Home() {
  const { publicKey } = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box>
      <Flex px={4} py={4}>
        <Spacer />
        <WalletMultiButton />
      </Flex>

      <VStack justifyContent="center">
        <CounterState />s
        {publicKey && (
          <>
            <IncrementButton />
            <Button onClick={onOpen}>Solana Pay</Button>
          </>
        )}
        {isOpen && <QrModal onClose={onClose} />}
      </VStack>
    </Box>
  );
}
