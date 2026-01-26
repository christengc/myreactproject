import './App.css'
import { Heading, Link, Flex, List,ListItem, Spacer, Drawer, Portal, CloseButton, Box, Container, Grid, GridItem, Icon, VStack} from "@chakra-ui/react"
import { Outlet } from "react-router-dom";
import { MdContactPhone } from "react-icons/md";
import { RiProjector2Fill } from "react-icons/ri";
import { FaKissWinkHeart } from "react-icons/fa";
import { PiReadCvLogoFill } from "react-icons/pi";
import { GiHamburgerMenu } from "react-icons/gi";


const applyFont = {
  fontFamily: 'Quirky Robot, sans-serif',
  webkitTextStroke: '2px #fff'
}

const noBullet = {

  listStyleType: 'none',
  padding: 0,
  margin: 0
}

function handleClick() {

    
  }

function App() {

  return (
    <>
        <Container bg="bg.subtle">
          
          <Heading bg="yellow.solid" p="1em" borderColor="gray.300" borderWidth="2px" borderRadius="8px" >
            <Flex alignContent="flex-center" justify="space-around">
              <Box as="button" hideFrom="md" m="auto" onClick={handleClick}>
              <Drawer.Root size="xs" placement="start">
                <Drawer.Trigger>
                    <Icon color="white">
                      <GiHamburgerMenu size="2em"/>
                    </Icon>
                </Drawer.Trigger>
                <Portal>
                  <Drawer.Backdrop />
                  <Drawer.Positioner>
                    <Drawer.Content>
                      <Drawer.Header bg="yellow.solid">
                      </Drawer.Header>
                      <Drawer.Body bg="yellow.solid">
                <VStack bg="yellow.solid" style={noBullet}>
                <Box p="1em" ml="1em" mr="auto">
                  <Icon as={FaKissWinkHeart} mr="0.5em"></Icon>
                  <Link variant="plain" href="/about" textAlign="left">
                    Who is Christen?
                  </Link>
                </Box>
                <Box p="1em" ml="1em" mr="auto">
                  <Icon as={PiReadCvLogoFill} mr="0.5em"></Icon>
                  <Link variant="plain" href="/cv" textAlign="left">
                    Curriculum vitae
                  </Link>
                </Box>
                <Box p="1em" ml="1em" mr="auto">
                  <Icon as={PiReadCvLogoFill} mr="0.5em"></Icon>
                  <Link variant="plain" href="/ongoing" textAlign="left">
                    Current Work
                  </Link>
                </Box>
                <Box p="1em" ml="1em" mr="auto">
                  <Icon as={RiProjector2Fill} mr="0.5em"></Icon>
                  <Link variant="plain" href="/projects" textAlign="left">
                    Selected Projects
                  </Link>
                </Box>
                <Box p="1em" ml="1em" mr="auto">
                <Icon as={MdContactPhone} mr="0.5em"></Icon>
                <Link variant="plain" href="/contact" textAlign="left">
                    Contact
                  </Link>
                </Box>
              </VStack>
                      </Drawer.Body>
                        <Drawer.CloseTrigger asChild>
                          <CloseButton size="sm" />
                        </Drawer.CloseTrigger>
                    </Drawer.Content>
                  </Drawer.Positioner>
                </Portal>
              </Drawer.Root>
                </Box>
              <Spacer />
              <Box textStyle="4xl" p="10px" style={applyFont}>DIGITAL</Box>
              <Box alignContent="flex-end" p="10px">Christen</Box>
              <Spacer />
            </Flex>
          </Heading>
                  
        <Grid templateColumns="minmax(220px, 1fr) 1fr 1fr 1fr 1fr 1fr" gap={4}>
          <GridItem as="aside" hideBelow="md" colSpan={1} bg="bg.subtle" height="100vh" id="menuNav">
            
            <Box bg="yellow.solid" p="2em" borderColor="gray.300" borderWidth="2px" borderRadius="8px" m="2em 0em">
            
              <List.Root bg="yellow.solid" style={noBullet}>
                <ListItem>
                  <Icon as={FaKissWinkHeart} mr="0.5em"></Icon>
                  <Link variant="plain" href="/about" textAlign="left">
                    Who is Christen?
                  </Link>
                </ListItem>
                <List.Item>
                  <Icon as={PiReadCvLogoFill} mr="0.5em"></Icon>
                  <Link variant="plain" href="/cv" textAlign="left">
                    Curriculum vitae
                  </Link>
                </List.Item>
                <List.Item>
                  <Icon as={PiReadCvLogoFill} mr="0.5em"></Icon>
                  <Link variant="plain" href="/ongoing" textAlign="left">
                    Current Work
                  </Link>
                </List.Item>
                <List.Item>
                  <Icon as={RiProjector2Fill} mr="0.5em"></Icon>
                  <Link variant="plain" href="/projects" textAlign="left">
                    Selected Projects
                  </Link>
                </List.Item>
                <List.Item>
                <Icon as={MdContactPhone} mr="0.5em"></Icon>
                <Link variant="plain" href="/contact" textAlign="left">
                    Contact
                  </Link>
                </List.Item>
              </List.Root>
            </Box>

          </GridItem>
          <GridItem as="main" colSpan={{ base: 6, md: 5 }} bg="bg.subtle">

          <Outlet>

          </Outlet>

            

          </GridItem>
        </Grid>
        </Container>
    </>
  )
}

export default App
