import { Box, Flex, Spacer, VStack } from "@chakra-ui/react";
import WalletMultiButton from "@/components/WalletMultiButton";
import CounterState from "@/components/CounterState";
import IncrementButton from "@/components/IncrementButton";
import SolanaPayQR from "@/components/SolanaPayQR";

export default function Home() {
  return (
    <Box>
      <Flex px={4} py={4}>
        <Spacer />
        <WalletMultiButton />
      </Flex>

      <VStack justifyContent="center">
        <CounterState />
        <IncrementButton />
        <SolanaPayQR />
      </VStack>
    </Box>
  );
}
