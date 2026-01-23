import { Fieldset, Stack, Container,Textarea, Field,Text, Input, NativeSelect, For, Button } from "@chakra-ui/react";

export default function Contact() {
  return (
    <Container mt="2em" bg="cyan.solid" px="2" p="2em" borderColor="gray.300" borderWidth="2px" borderRadius="8px" m="2em 0em">
     <Fieldset.Root size="lg" maxW="md">
      
      <Stack>
        <Fieldset.Legend fontSize="2em" color="white" pb="1em">Contact details</Fieldset.Legend>
        <Fieldset.HelperText>
          <Text color="white" fontSize="1.5em" minWidth="30em">I love to hear from you. Maybe you have a questions? or are interested in collaborating ? or something I didnt even think of :) please surprise me :)</Text>
        </Fieldset.HelperText>
      </Stack>

      <Fieldset.Content maxWidth="30em">

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
    </Container>
  )
}
