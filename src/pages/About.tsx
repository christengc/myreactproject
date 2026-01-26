import { Box, Center, Container, Heading, Flex,Link, Text, Image, GridItem, Grid, Icon } from "@chakra-ui/react";
import { IoIosTennisball  } from 'react-icons/io';
import { FaPersonSwimming } from "react-icons/fa6";
import { MdRollerSkating } from "react-icons/md";
import { FaComputer } from "react-icons/fa6";
import { MdOutlineFamilyRestroom } from "react-icons/md";
import { GiHammerNails } from "react-icons/gi";
import { FaExternalLinkSquareAlt } from "react-icons/fa";
import { FaChessBoard } from "react-icons/fa6";
import { GiWeightLiftingUp } from "react-icons/gi";






const ItemStyle = {
   height: "8em" ,
   margin: "2em 2em" ,
   backgroundColor: "white",
   borderWidth: "2px",
   borderRadius: "32px",
   fontWeight:"bold",
   padding: "0.5em"
}


export default function About() {
  return (
    <Container fluid>
      <Box px="2" bg="cyan.solid" p="2em" borderColor="gray.300" borderWidth="2px" borderRadius="8px" m="2em 0em">
        <Center><Heading as="h2" color="white" fontSize="5xl" p="1em">Nice to meet you :)</Heading></Center>
        <Text maxW="60%" p="0.5em 0em" color="white" fontSize="xl">Since you are here, let me tell you a bit about myself. On this page you can read about my hobbies and my professional interests.</Text>

        <Flex justify="flex-end" pr="0.5em" mt="-9em"><Image borderRadius="full" fit="cover" w="25%" minW="10em" padding="0.5em" src="/christen.jpg" alt="react" /></Flex>
        </Box>
      <Box px="2" bg="orange.200" p="2em" borderColor="gray.300" borderWidth="2px" borderRadius="8px" m="2em 0em">
         <Heading as="h3" size="2xl">It all started with HTML 4.01 and Helena Christensen</Heading>
         <br/>
         <Text maxW="37em" p="0.5em 0em" color="Black" fontSize="md">
          I developed my first webpage in 1998, when I was 15 years old approximatly when the HTML 4.01 specification was released. You can still find the page on Way Back Machine here:  
          <Link color="Black" target="_blank" href="https://web.archive.org/web/20030402184329/http://home0.inet.tele.dk/Christen/" m="0em 1em">
           The Greatest Tribute to Helena Christensen <FaExternalLinkSquareAlt  />
          </Link>
          <br/><br/>
          I then took a long brake from web development and released my next webpage in 2013, approximatly when HTML5 was released, as I develoepd a collaboration platform based on html5 and web 2.0 principles. This site was called sammenspil.dk you can also see in way back machine here:
          <Link target="_blank" href="https://web.archive.org/web/20140210065209/http://www.sammenspil.dk/mobile/index.php" color="Black" m="0em 1em">
          www.sammenspil.dk <FaExternalLinkSquareAlt/> 
          </Link>
          You can also watch a youtube video (in danish) explaining the concept here: 
          <Link href="https://www.youtube.com/watch?v=qGX4YSsUZrk" target="_blank" color="Black" m="0em 1em">
          What is sammenspil<FaExternalLinkSquareAlt  />
          </Link>
          <br/><br/>
          Then I took a smaller brake from web development, but in 2017 I released a smartwatch app acompanied by a webpage called www.watchandspin.com where the user could design their own quiz for smartwatches and share it.
          Link for way back machine and youtube can be found here:
          <Link href="https://web.archive.org/web/20180808002923/http://watchandspin.com/" target="_blank" color="Black" m="0em 1em">www.watchandspin.com <FaExternalLinkSquareAlt  /></Link>
          <Link href="https://www.youtube.com/watch?v=I02Dh1zemuM" target="_blank" color="Black" m="0em 1em">demo on youtube <FaExternalLinkSquareAlt  /></Link>
          </Text>
      </Box>
      <Box px="2" bg="cyan.solid" p="2em" borderColor="gray.300" borderWidth="2px" borderRadius="8px" m="2em 0em">
        <Heading as="h3" color="white"size="2xl">What i like to do in my sparetime</Heading>
        <Grid templateRows="repeat(2, 1fr)"   
              templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)" }} 
              gap={4} mt="2em">
            <GridItem>
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                Tennis       
                <Center mt="0.5em"><Icon color="yellow.solid"><IoIosTennisball background-color="black" size="4em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem >
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                Swimming
                <Center mt="0.5em"><Icon color="cyan.solid"><FaPersonSwimming size="4em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem><Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                Roller skating
                <Center mt="0.5em"><Icon color="pink.solid"><MdRollerSkating size="4em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem>
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                Computers
                <Center mt="0.5em"><Icon color="cyan.solid"><FaComputer size="4em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem>
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                Family
                <Center mt="0.5em"><Icon color="cyan.solid"><MdOutlineFamilyRestroom size="4em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem>
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                DIY
                <Center mt="0.5em"  ><Icon color="black.solid"><GiHammerNails size="4em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem>
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                Chess
                <Center mt="0.5em"  ><Icon color="black.solid" height="100%"><FaChessBoard  size="4em" /></Icon></Center>
              </Box>
            </GridItem>
                        <GridItem>
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                Chess
                <Center mt="0.5em"  ><Icon color="black.solid" height="100%"><GiWeightLiftingUp size="4em"/></Icon></Center>
              </Box>
            </GridItem>
        </Grid>
      </Box>
    </Container>
  )
}
