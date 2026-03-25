import { Flex, Container, Heading, List, Link, Text, Box} from "@chakra-ui/react"
import { RiProgress6Line } from "react-icons/ri";

const fontLuckiestGuy = {
  fontFamily: 'LuckiestGuy'
}

export default function Ongoing() {
  return (
    <Container>
    <Box  className="dropShadow">
    <Heading as="h2" pb="2em" size="2xl" style={fontLuckiestGuy}>Ongoing work</Heading>
    <Text textStyle="xl" maxWidth="30em">This section is new. My older projects are not included here, but going forward, when I have time, I will present my pet projects here in a transparent way, so others can comment on them and collaborate.</Text>      
     <List.Root gap="2" variant="plain" align="center" mt="4em">
      <List.Item>
        <List.Indicator asChild color="#2B4570">
          <RiProgress6Line />
        </List.Indicator>
        <Link href="/ongoing/shapes" >Check out my Shape project, which allows you to easily arrange HTML elements into a shape.</Link>
      </List.Item>
      <List.Item>
        <List.Indicator asChild color="#2B4570">
          <RiProgress6Line />
        </List.Indicator>
        <Link href="/ongoing/mail-rendering">Mail Rendering sandbox for template experiments.</Link>
      </List.Item>
      <List.Item>
        <List.Indicator asChild color="#2B4570">
          <RiProgress6Line />
        </List.Indicator>
        <Link href="/ongoing/3d-store">3D Store: Interactive 3D store demo (WASD + mouse)</Link>
      </List.Item>
      <List.Item>
        <List.Indicator asChild color="#2B4570">
          <RiProgress6Line />
        </List.Indicator>
        To come....
      </List.Item>
    </List.Root>
    
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
