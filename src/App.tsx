import './App.css'
import './fonts/Gugi-Regular.ttf';
import './fonts/RubikGlitch-Regular.ttf';
//import './fonts/LuckiestGuy-Regular.ttf';
import { Heading, Link, Flex, List,ListItem, Spacer, Image, Drawer, Portal, CloseButton, Box, Container, Grid, GridItem, Icon, VStack} from "@chakra-ui/react"
import { Outlet } from "react-router-dom";
import { MdContactPhone } from "react-icons/md";
import { RiProjector2Fill } from "react-icons/ri";
import { FaKissWinkHeart } from "react-icons/fa";
import { PiReadCvLogoFill } from "react-icons/pi";
import { GiHamburgerMenu } from "react-icons/gi";

const applyFont = {
  fontFamily: 'gugi',
  WebkitTextStroke: '1px #fff',
  fontDisplay: 'swap'
}

const applyFont2 = {
  fontFamily: 'rubikGlitch',
  WebkitTextStroke: '1px #fff',
  fontDisplay: 'swap'
}

const noBullet = {

  listStyleType: 'none',
  padding: 0,
  margin: 0,
  fontFamily: 'LuckiestGuy',
  color: '#2B4570'
}

function handleClick() {

    
  }

function App() {

  return (
    <>
        <Container>
          
          <Heading bg="yellow.solid/50" p="1em" borderColor="gray.300" borderWidth="2px" borderRadius="8px" >
            <Flex alignContent="flex-center" justify="space-around">
              <Box hideFrom="md" m="auto" onClick={handleClick}>
              <Drawer.Root size="xs" placement="start">
                <Drawer.Trigger>
                    <Icon color="white">
                      <GiHamburgerMenu size="2em"/>
                    </Icon>
                </Drawer.Trigger>
                <Portal>
                  <Drawer.Backdrop />
                  <Drawer.Positioner>
                    <Drawer.Content bg="white/0">
                      <Drawer.Header bg="yellow.solid/90">
                      </Drawer.Header>
                      <Drawer.Body bg="yellow.solid/90">
                <VStack style={noBullet} >
                <Box p="1em" ml="1em" mr="auto">
                  <Icon as={FaKissWinkHeart} mr="0.5em"></Icon>
                  <Link color="#2B4570" variant="plain" href="/about" textAlign="left">
                    Who is Christen123?
                  </Link>
                </Box>
                <Box p="1em" ml="1em" mr="auto">
                  <Icon as={PiReadCvLogoFill} mr="0.5em"></Icon>
                  <Link color="#2B4570" variant="plain" href="/cv" textAlign="left">
                    Curriculum vitae
                  </Link>
                </Box>
                <Box p="1em" ml="1em" mr="auto">
                  <Icon as={PiReadCvLogoFill} mr="0.5em"></Icon>
                  <Link color="#2B4570" variant="plain" href="/ongoing" textAlign="left">
                    Ongoing Work
                  </Link>
                </Box>
                <Box p="1em" ml="1em" mr="auto">
                  <Icon as={RiProjector2Fill} mr="0.5em"></Icon>
                  <Link color="#2B4570" variant="plain" href="/projects" textAlign="left">
                    Selected Projects
                  </Link>
                </Box>
                <Box p="1em" ml="1em" mr="auto">
                <Icon as={MdContactPhone} mr="0.5em"></Icon>
                <Link color="#2B4570" variant="plain" href="/contact" textAlign="left">
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
              <Box textStyle="4xl"  mt="auto" mb="auto" ml="0.5em"  fontSize={{sm: "1.5em", md: "2.5em" }} fontWeight="100" style={applyFont}>DIGITAL</Box>
              <Box alignContent="flex-end"  mt="auto" mb="auto" ml="0.5em"  fontSize={{sm: "1.5em", md: "2em" }} fontWeight="100" color="#2B4570" style={applyFont2}>Christen</Box>
              <Spacer />
              <Image src="/logo.png" mt="auto" mb="auto" mr={{sm: "0em" , md: "1em"}} width={{base: "3em", sm: "3em" , md: "4em"}} height={{base: "3em", sm: "3em" , md: "4em"}} borderRadius="2em" bg="#2B4570"></Image>
            </Flex>
          </Heading>
                  
        <Grid templateColumns="minmax(220px, 1fr) 1fr 1fr 1fr 1fr 1fr" gap={4}>
          <GridItem as="aside" hideBelow="md" colSpan={1} height="100vh" id="menuNav" bg="rgba(0,0,0,0)">
            
            <Box bg="yellow.solid/50" p="1.5em" borderColor="gray.300" borderWidth="2px" borderRadius="8px" m="2em 0em">
            
              <List.Root  style={noBullet}>
                <ListItem mb="1em"  pt="1em">
                  <Icon as={FaKissWinkHeart} mr="0.5em"></Icon>
                  <Link variant="plain" color="#2B4570" href="/about" textAlign="left">
                    Who is Christen?
                  </Link>
                </ListItem>
                <List.Item mb="1em">
                  <Icon as={PiReadCvLogoFill} mr="0.5em"></Icon>
                  <Link color="#2B4570" variant="plain" href="/cv" textAlign="left">
                    Curriculum vitae
                  </Link>
                </List.Item>
                <List.Item mb="1em">
                  <Icon as={PiReadCvLogoFill} mr="0.5em"></Icon>
                  <Link color="#2B4570" variant="plain" href="/ongoing" textAlign="left">
                    Ongoing Work
                  </Link>
                </List.Item>
                <List.Item mb="1em">
                  <Icon as={RiProjector2Fill} mr="0.5em"></Icon>
                  <Link color="#2B4570" variant="plain" href="/projects" textAlign="left">
                    Selected Projects
                  </Link>
                </List.Item>
                <List.Item mb="1em">
                <Icon as={MdContactPhone} mr="0.5em"></Icon>
                <Link color="#2B4570" variant="plain" href="/contact" textAlign="left">
                    Contact
                  </Link>
                </List.Item>
              </List.Root>
            </Box>

          </GridItem>
          <GridItem as="main" colSpan={{ base: 6, md: 5 }} bg="rgba(0,0,0,0)">

          <Outlet>

          </Outlet>

            

          </GridItem>
        </Grid>
        </Container>
    </>
  )
}

export default App
