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
   height: "8em",
   width: "8em",
   margin: "1em 1em",
   backgroundColor: "white",
   borderWidth: "2px",
   borderRadius: "32px",
   fontWeight:"bold",
   padding: "0.5em"
}

const ItemTextStyle = {
   backgroundColor: "#2AB7CA",
   color: "white",
   borderWidth: "0px",
   borderRadius: "32px 32px 0 0",
   height: "3em",
   marginTop: "-0.5em",
   width: "7.8em",
   marginLeft: "-0.5em"
}

const fontLuckiestGuy = {
  fontFamily: 'LuckiestGuy'
}


export default function About() {
  return (
    <Container>
      <Box className="dropShadow">
        <Heading as="h2" fontSize="5xl" lineHeight="1.2" color="cyan.solid" pb="1em" style={fontLuckiestGuy}>Nice to meet you :)</Heading>
        <Text maxW="55%" color="#2B4570" p="0.5em 0em" fontSize="xl">Since you are here, let me tell you a bit about myself. On this page you can read about my hobbies and my professional interests.</Text>

        <Flex justify="flex-end" mt="-9em"><Image borderRadius="full" fit="cover" w="25%" minW={{base: "6em", sm: "6em", md: "8em" }} mr="-1em" src="/christen.jpg" alt="react" /></Flex>
        </Box>
      <Box className="dropShadow">
         <Heading style={fontLuckiestGuy} as="h2" size="2xl">It all started with HTML 4.01 and Helena Christensen</Heading>
         <br/>
         <Text maxW="37em" p="0.5em 0em" fontSize="md">
          I developed my first webpage in 1998, when I was 15 years old approximatly when the HTML 4.01 specification was released. You can still find the page on Way Back Machine here:  
          <Link target="_blank" color="#2B4570" href="https://web.archive.org/web/20030402184329/http://home0.inet.tele.dk/Christen/" m="0em 1em">
           The Greatest Tribute to Helena Christensen <FaExternalLinkSquareAlt  />
          </Link>
          <br/><br/>
          I then took a long brake from web development and released my next webpage in 2013, approximatly when HTML5 was released, as I develoepd a collaboration platform based on html5 and web 2.0 principles. This site was called sammenspil.dk you can also see in way back machine here:
          <Link target="_blank" color="#2B4570" href="https://web.archive.org/web/20140210065209/http://www.sammenspil.dk/mobile/index.php" m="0em 1em">
          www.sammenspil.dk <FaExternalLinkSquareAlt/> 
          </Link>
          You can also watch a youtube video (in danish) explaining the concept here: 
          <Link color="#2B4570" href="https://www.youtube.com/watch?v=qGX4YSsUZrk" target="_blank" m="0em 1em">
          What is sammenspil<FaExternalLinkSquareAlt  />
          </Link>
          <br/><br/>
          Then I took a smaller brake from web development, but in 2017 I released a smartwatch app acompanied by a webpage called www.watchandspin.com where the user could design their own quiz for smartwatches and share it.
          Link for way back machine and youtube can be found here:
          <Link color="#2B4570" href="https://web.archive.org/web/20180808002923/http://watchandspin.com/" target="_blank" m="0em 1em">www.watchandspin.com <FaExternalLinkSquareAlt  /></Link>
          <Link color="#2B4570" href="https://www.youtube.com/watch?v=I02Dh1zemuM" target="_blank" m="0em 1em">demo on youtube <FaExternalLinkSquareAlt  /></Link>
          </Text>
      </Box>
      <Box className="dropShadow">
        <Heading as="h3" size="2xl" style={fontLuckiestGuy}>What i like to do in my sparetime</Heading>
        <Grid color="#2B4570" templateRows="repeat(2, 1fr)"   
              templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)"}} 
              gap={1} mt="2em">
            <GridItem>
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Tennis</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570"><IoIosTennisball background-color="black" size="3em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem >
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Swimming</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570"><FaPersonSwimming size="3em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem><Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Roller skating</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570"><MdRollerSkating size="3em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem>
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Computers</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570"><FaComputer size="3em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem>
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Family</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570"><MdOutlineFamilyRestroom size="3em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem>
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >DIY</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570"><GiHammerNails size="3em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem>
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Chess</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570" height="100%"><FaChessBoard  size="3em" /></Icon></Center>
              </Box>
            </GridItem>
                        <GridItem>
              <Box style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Wedight lifting</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570" height="100%"><GiWeightLiftingUp size="3em"/></Icon></Center>
              </Box>
            </GridItem>
        </Grid>
      </Box>
    </Container>
  )
}
