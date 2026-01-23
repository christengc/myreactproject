import { Flex, Spinner,Heading, Box, Text} from "@chakra-ui/react"

export default function Ongoing() {
  return (
    <Box>
    <Text p="2em" textStyle="xl" maxWidth="30em">Nothing to show right now, but come back soon and hopefully I will have had time to put my work online to share with you.</Text>
    <Flex
      align="center"
      justify="center"
      height="100vh"
    >
    <Spinner color="yellow.solid" borderWidth="4px" size="xl" animationDuration="1s"/>
    </Flex>
    </Box>
  )
}
