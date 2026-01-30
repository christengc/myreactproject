import { Flex, Container, Heading, Text} from "@chakra-ui/react"

export default function Ongoing() {
  return (
    <Container className="dropShadow" bg="white" px="2" p="2em" borderColor="gray.300" borderWidth="2px" borderRadius="8px" m="2em 0em">
    <Heading as="h2" pb="2em" size="2xl">Current work</Heading>
    <Text textStyle="xl" maxWidth="30em">Nothing to show right now, but come back soon and hopefully I will have had time to put my work online to share with you.</Text>
    <Flex
      align="center"
      justify="center"
      height="100vh"
    >
    </Flex>
    </Container>
  )
}
