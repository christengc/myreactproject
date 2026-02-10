import { Fieldset, Container,Textarea, Box,Link,Flex, Spacer, Image, Icon, VStack, Field, Text, Input, Button, Stack } from "@chakra-ui/react";
import { MdOutlineEmail } from "react-icons/md";
import { ImLinkedin } from "react-icons/im";
import { BiMobileVibration } from "react-icons/bi";

const fontLuckiestGuy = {
  fontFamily: 'LuckiestGuy'
}

export default function Contact() {
  return (
    <Container>
     <Box className="dropShadow">
     <VStack>
      <Box  ml="0" mr="auto">
        <Fieldset.Root size="lg" maxW="md">
          
          <Stack>
            <Fieldset.Legend   as="h2" pb="2em" fontSize="1.5em" color="#2B4570" style={fontLuckiestGuy}>Drop a message</Fieldset.Legend>
            <Fieldset.HelperText>
              <Text color="#2B4570" fontSize="1.5em">I love to hear from you. Maybe you have a questions? or are interested in collaborating ? or something I didnt even think of :) please surprise me :)</Text>
            </Fieldset.HelperText>
          </Stack>

          <Fieldset.Content color="#2B4570" >

            <Field.Root>
              <Field.Label >Name</Field.Label>
              <Input bg="white" name="name" placeholder="Your full name here" />
            </Field.Root>

            <Field.Root>
              <Field.Label >Email address</Field.Label>
              <Input bg="white" name="email" type="email" placeholder="mymail@provider.com"/>
            </Field.Root>

            <Field.Root>
              <Field.Label >Message</Field.Label>
              <Textarea bg="white" variant="outline" placeholder="Spill the beans..." />
            </Field.Root>

          </Fieldset.Content>

          <Button bg="#2AB7CA" type="submit" alignSelf="flex-start">
            Send Message
          </Button>
        </Fieldset.Root>
      </Box>
      <Box width="100%" pt="5em">
              <Stack direction={{ lgDown: "column"}}>
                <Flex>
                  <Icon color="#2B4570"><MdOutlineEmail size="2em"/></Icon>
                  <Text color="#2B4570" display="inline" alignContent="center" pl="0.5em">christenchristensen@live.dk</Text>
                </Flex>
                <Spacer />
                <Flex>
                  <Icon><BiMobileVibration size="2em" color="#2B4570"/></Icon>
                  <Image height="2em" display="inline" src="/Uden titel.png" pl="0.5em"></Image>
                </Flex>
                <Spacer />
                <Flex>
                  <Icon color="#2B4570"><ImLinkedin size="2em"/></Icon>
                  <Link alignContent="center" color="wh#2B4570ite" href="https://www.linkedin.com/in/christen-g-christensen/>" target="_blank" ml="0.5em">LinkedIn</Link>
                </Flex>
              </Stack>
      </Box>
    </VStack>
    </Box>
    </Container>
  )
}
