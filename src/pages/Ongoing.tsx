import { Flex, Container, Heading, Text, Box} from "@chakra-ui/react"

const fontLuckiestGuy = {
  fontFamily: 'LuckiestGuy'
}

export default function Ongoing() {
  return (
    <Container>
    <Box  className="dropShadow">
    <Heading as="h2" pb="2em" size="2xl" style={fontLuckiestGuy}>Ongoing work</Heading>
    <Text textStyle="xl" maxWidth="30em">Nothing to show right now, but come back soon and hopefully I will have had time to put my work online to share with you.</Text>
    <Flex
      align="center"
      justify="center"
      height="100vh"
    >
    </Flex>
    </Box>
    </Container>
  )
}
