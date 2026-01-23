import './App.css'
import { Heading, Link, Flex, List,ListItem, Spacer, Box, Container, Grid, GridItem, Icon} from "@chakra-ui/react"
import { Outlet } from "react-router-dom";
import { MdContactPhone } from "react-icons/md";
import { RiProjector2Fill } from "react-icons/ri";
import { FaKissWinkHeart } from "react-icons/fa";
import { PiReadCvLogoFill } from "react-icons/pi";


const applyFont = {
  fontFamily: 'Quirky Robot, sans-serif',
  webkitTextStroke: '2px #fff'
}

const noBullet = {

  listStyleType: 'none',
  padding: 0,
  margin: 0
}



function App() {

  return (
    <>
        <Container bg="bg.subtle">
          
          <Heading bg="yellow.solid" p="1em" borderColor="gray.300" borderWidth="2px" borderRadius="8px" >
            <Flex alignContent="flex-center" justify="space-around"><Spacer /><Box textStyle="4xl" p="10px" style={applyFont}>DIGITAL</Box><Box alignContent="flex-end" p="10px">Christen</Box><Spacer /></Flex>
          </Heading>
                  
        <Grid templateColumns="repeat(6, 1fr)" gap={4}>
          <GridItem as="aside" colSpan={1} bg="bg.subtle" height="100vh">
            
            <Box bg="yellow.solid" p="2em" borderColor="gray.300" borderWidth="2px" borderRadius="8px" m="2em 0em">
            
              <List.Root bg="yellow.solid" style={noBullet}>
                <ListItem>
                  <Icon as={FaKissWinkHeart} mr="0.5em"></Icon>
                  <Link variant="plain" href="about" textAlign="left">
                    Who is Christen?
                  </Link>
                </ListItem>
                <List.Item>
                  <Icon as={PiReadCvLogoFill} mr="0.5em"></Icon>
                  <Link variant="plain" href="cv" textAlign="left">
                    Curriculum vitae
                  </Link>
                </List.Item>
                <List.Item>
                  <Icon as={PiReadCvLogoFill} mr="0.5em"></Icon>
                  <Link variant="plain" href="ongoing" textAlign="left">
                    Current Work
                  </Link>
                </List.Item>
                <List.Item>
                  <Icon as={RiProjector2Fill} mr="0.5em"></Icon>
                  <Link variant="plain" href="projects" textAlign="left">
                    Selected Projects
                  </Link>
                </List.Item>
                <List.Item>
                <Icon as={MdContactPhone} mr="0.5em"></Icon>
                <Link variant="plain" href="contact" textAlign="left">
                    Contact
                  </Link>
                </List.Item>
              </List.Root>
            </Box>

          </GridItem>
          <GridItem as="main" colSpan={5} bg="bg.subtle">

          <Outlet>

          </Outlet>

            

          </GridItem>
        </Grid>
        </Container>
    </>
  )
}

export default App
