import { Fieldset, Container,Textarea, Box,Link,Flex, Spacer, Image, Icon, VStack, Field, Text, Input, Button, Stack } from "@chakra-ui/react";
import { MdOutlineEmail } from "react-icons/md";
import { ImLinkedin } from "react-icons/im";
import { BiMobileVibration } from "react-icons/bi";
import { useState } from "react";

const fontLuckiestGuy = {
  fontFamily: 'LuckiestGuy'
}

async function sendMessage(name: string, email: string, message: string) {
    // POST to backend route
    
    const recipients = ["christenchristensen@live.dk"];
    const sender = "test@christenchristensen.dk";
    const subject = `New message from ${name} (${email})`;
    const content = `<p>${message}</p>`;
    const response = await fetch("https://api.christenchristensen.dk/api/send-mail", {

        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: sender,
            to: recipients,
            subject: subject,
            html: content
        })
    });
}
export default function Contact() {

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [message, setMessage] = useState("");

  return (
    <Container>
     <Box className="dropShadow">
     <VStack>
      <Box  ml="0" mr="auto">
        <Fieldset.Root size="lg" maxW="md">
          
          <Stack>
            <Fieldset.Legend   as="h2" pb="2em" fontSize="1.5em" color="#2B4570" style={fontLuckiestGuy}>Drop a message</Fieldset.Legend>
            <Fieldset.HelperText>
              <Text color="#2B4570" fontSize="1.5em">I’d love to hear from you. Maybe you have a question? Or are interested in collaborating? Or something I didn’t even think of :) Please surprise me.</Text>
            </Fieldset.HelperText>
          </Stack>

          <Fieldset.Content color="#2B4570" >

            <Field.Root>
              <Field.Label >Name</Field.Label>
              <Input bg="white" name="name" placeholder="Your full name here" onChange={(e) => setName(e.target.value)} />
            </Field.Root>

            <Field.Root>
              <Field.Label >Email address</Field.Label>
              <Input bg="white" name="email" type="email" placeholder="mymail@provider.com" onChange={(e) => setEmail(e.target.value)} />
            </Field.Root>

            <Field.Root>
              <Field.Label >Message</Field.Label>
              <Textarea bg="white" variant="outline" placeholder="Spill the beans..." onChange={(e) => setMessage(e.target.value)} />
            </Field.Root>

          </Fieldset.Content>

          <Button bg="#2AB7CA" type="submit" onClick={() => sendMessage(name, email, message)} alignSelf="flex-start">
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
