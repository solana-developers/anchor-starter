import { Box, Flex, Spacer, VStack } from "@chakra-ui/react";
import WalletMultiButton from "@/components/WalletMultiButton";
import IncrementButton from "@/components/IncrementButton";

export default function Home() {
  return (
    <Box>
      <Flex px={4} py={4}>
        <Spacer />
        <WalletMultiButton />
      </Flex>
      <VStack justifyContent="center">
        <IncrementButton />
      </VStack>
    </Box>
  );
}
