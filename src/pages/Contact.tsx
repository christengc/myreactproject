import { Fieldset, Stack, Container,Textarea, Box,Link,Flex, Spacer, Image, Icon, VStack, Field, Text, Input, Button, HStack } from "@chakra-ui/react";
import { MdOutlineEmail } from "react-icons/md";
import { ImLinkedin } from "react-icons/im";
import { BiMobileVibration } from "react-icons/bi";



export default function Contact() {
  return (
    <Container mt="2em" bg="cyan.solid" px="2" p="2em" borderColor="gray.300" borderWidth="2px" borderRadius="8px" m="2em 0em">
     <VStack>
      <Box  ml="0" mr="auto">
        <Fieldset.Root size="lg" maxW="md">
          
          <Stack>
            <Fieldset.Legend fontSize="2em" color="white" pb="1em">Drop a message</Fieldset.Legend>
            <Fieldset.HelperText>
              <Text color="white" fontSize="1.5em">I love to hear from you. Maybe you have a questions? or are interested in collaborating ? or something I didnt even think of :) please surprise me :)</Text>
            </Fieldset.HelperText>
          </Stack>

          <Fieldset.Content>

            <Field.Root>
              <Field.Label color="white">Name</Field.Label>
              <Input bg="white" name="name" placeholder="Your full name here" />
            </Field.Root>

            <Field.Root>
              <Field.Label color="white">Email address</Field.Label>
              <Input bg="white" name="email" type="email" placeholder="mymail@provider.com"/>
            </Field.Root>

            <Field.Root>
              <Field.Label color="white">Message</Field.Label>
              <Textarea bg="white" variant="outline" placeholder="Spill the beans..." />
            </Field.Root>

          </Fieldset.Content>

          <Button type="submit" alignSelf="flex-start">
            Send Message
          </Button>
        </Fieldset.Root>
      </Box>
      <Box width="100%" pt="5em">
              <HStack>
                <Flex>
                  <Text color="white" display="inline" alignContent="center" pr="0.5em">christenchristensen@live.dk</Text>
                  
                  <Icon color="black.solid" height="100%"><MdOutlineEmail size="2em"/></Icon>
                </Flex>
                <Spacer />
                <Flex>
                  <Image height="2em" display="inline" src="/Uden titel.png" pr="0.5em"></Image>
                  
                  <Icon><BiMobileVibration size="2em"/></Icon>
                </Flex>
                <Spacer />
                <Flex>
                  <Link alignContent="center" color="white" href="https://www.linkedin.com/in/christen-g-christensen/>" target="_blank" mr="0.5em">LinkedIn</Link>
                  
                  <Icon color="black.solid" height="100%"><ImLinkedin size="2em"/></Icon>
                </Flex>
              </HStack>
      </Box>
    </VStack>
    </Container>
  )
}
