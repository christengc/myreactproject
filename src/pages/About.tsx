import { Box, Center, Container, Carousel, IconButton, Heading, Flex,Link, Text, Image, GridItem, Grid, Icon } from "@chakra-ui/react";
import { IoIosTennisball  } from 'react-icons/io';
import { FaPersonSwimming } from "react-icons/fa6";
import { MdRollerSkating } from "react-icons/md";
import { FaComputer } from "react-icons/fa6";
import { MdOutlineFamilyRestroom } from "react-icons/md";
import { GiHammerNails } from "react-icons/gi";
import { FaExternalLinkSquareAlt } from "react-icons/fa";
import { FaChessBoard } from "react-icons/fa6";
import { GiWeightLiftingUp } from "react-icons/gi";
import { FaChevronLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";



const items = [
  {
    label: "Mountain Landscape",
    url: "/familie2.jpg",
  },
  {
    label: "Forest Path",
    url: "/familie1.jpg",
  },
  {
    label: "Ocean Waves",
    url: "/familie3.jpg",
  },
  {
    label: "Desert Dunes",
    url: "/familie4.jpg",
  }
]



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
        <Text maxW="55%" color="#2B4570" p="0.5em 0em" fontSize="xl">Since you're here, let me tell you a bit about myself. I'm a dad, an engineer, and a software developer with experience ranging from embedded systems to enterprise web applications. <br></br>

I enjoy working across the stack, with a particular interest in frontend development and building user-focused solutions. I'm passionate about new technology and enjoy diving into areas like machine learning, AI, and computer vision.<br></br>

On this page, you can explore both my professional work and some of the projects and interests I pursue in my spare time.<br></br></Text>

        <Flex justify="flex-end" mt="-9em"><Image borderRadius="full" fit="cover" w="25%" minW={{base: "6em", sm: "6em", md: "8em" }} mr="-1em" src="/christen.jpg" alt="react" /></Flex>
        </Box>
      <Box className="dropShadow">
         <Heading style={fontLuckiestGuy} as="h2" size="2xl">It all started with HTML 4.01 and it was Helena Christensen who sparked my technical interest</Heading>
         <br/>
         <Text maxW="37em" p="0.5em 0em" fontSize="md">
          I developed my first webpage in 1998, when I was 15 years old, approximately when the HTML 4.01 specification was released. You can still find the page on the Wayback Machine here:  
          <Link target="_blank" color="#2B4570" href="https://web.archive.org/web/20030402184329/http://home0.inet.tele.dk/Christen/" m="0em 1em">
           The Greatest Tribute to Helena Christensen <FaExternalLinkSquareAlt  />
          </Link>
          <br/><br/>
          I then took a long break from web development and released my next webpage in 2013, approximately when HTML5 was released, as I developed a collaboration platform based on HTML5 and Web 2.0 principles. This site was called sammenspil.dk. You can also see it on the Wayback Machine here:
          <Link target="_blank" color="#2B4570" href="https://web.archive.org/web/20140210065209/http://www.sammenspil.dk/mobile/index.php" m="0em 1em">
          www.sammenspil.dk <FaExternalLinkSquareAlt/> 
          </Link>
          You can also watch a YouTube video (in Danish) explaining the concept here: 
          <Link color="#2B4570" href="https://www.youtube.com/watch?v=qGX4YSsUZrk" target="_blank" m="0em 1em">
          What is sammenspil<FaExternalLinkSquareAlt  />
          </Link>
          <br/><br/>
          Then I took a shorter break from web development, but in 2017 I released a smartwatch app accompanied by a webpage called www.watchandspin.com
, where users could design their own quizzes for smartwatches and share them. Links to the Wayback Machine and YouTube can be found here:
          <Link color="#2B4570" href="https://web.archive.org/web/20180808002923/http://watchandspin.com/" target="_blank" m="0em 1em">www.watchandspin.com <FaExternalLinkSquareAlt  /></Link>
          <Link color="#2B4570" href="https://www.youtube.com/watch?v=I02Dh1zemuM" target="_blank" m="0em 1em">and demo on youtube <FaExternalLinkSquareAlt  /></Link>
          </Text>
          
         {/* Embedded YouTube video (Chakra Box with iframe) */}
          <Box mt={6} mb={6} w="100%" maxW="560px" style={{ marginLeft: 0 }} aspectRatio={16/9}>
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/nUosF1Rj38k"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ borderRadius: '12px', width: '100%', height: '100%' }}
            />
          </Box>

      </Box>
      <Box className="dropShadow">
      <Heading as="h3" size="2xl" style={fontLuckiestGuy} mb="2em">Meet my family</Heading>
      <Center>
        <Carousel.Root slideCount={items.length} maxW="2xl" gap="4">
          <Carousel.Control justifyContent="center" gap="4" width="full">
            <Carousel.PrevTrigger asChild>
              <IconButton size="xs" variant="outline">
                <FaChevronLeft />
              </IconButton>
            </Carousel.PrevTrigger>

            <Carousel.ItemGroup width="full">
              {items.map((item, index) => (
                <Carousel.Item key={index} index={index}>
                  <Image
                    aspectRatio="11/12"
                    src={item.url}
                    alt={item.label}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                </Carousel.Item>
              ))}
            </Carousel.ItemGroup>

            <Carousel.NextTrigger asChild>
              <IconButton size="xs" variant="outline">
                <FaChevronRight />
              </IconButton>
            </Carousel.NextTrigger>
          </Carousel.Control>

          <Carousel.IndicatorGroup>
            {items.map((item, index) => (
              <Carousel.Indicator
                key={index}
                index={index}
                unstyled
                _current={{
                  outline: "2px solid currentColor",
                  outlineOffset: "2px",
                }}
              >
                <Image
                  w="20"
                  aspectRatio="16/9"
                  src={item.url}
                  alt={item.label}
                  objectFit="cover"
                />
              </Carousel.Indicator>
            ))}
          </Carousel.IndicatorGroup>
        </Carousel.Root>
        </Center>
      </Box>
      <Box className="dropShadow">
        <Heading as="h3" size="2xl" style={fontLuckiestGuy}>What i like to do in my sparetime</Heading>
        <Grid color="#2B4570" templateRows="repeat(2, 1fr)"   
              templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)"}} 
              gap={1}
              mt="2em"
              justifyContent="center">
            <GridItem>
              <Box justifySelf="center" style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Tennis</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570"><IoIosTennisball background-color="black" size="3em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem >
              <Box justifySelf="center" style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Swimming</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570"><FaPersonSwimming size="3em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem>
              <Box justifySelf="center" style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Roller skating</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570"><MdRollerSkating size="3em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem>
              <Box justifySelf="center" style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Computers</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570"><FaComputer size="3em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem>
              <Box justifySelf="center" style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Family</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570"><MdOutlineFamilyRestroom size="3em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem>
              <Box justifySelf="center" style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >DIY</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570"><GiHammerNails size="3em"/></Icon></Center>
              </Box>
            </GridItem>
            <GridItem>
              <Box justifySelf="center" style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Chess</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570" height="100%"><FaChessBoard  size="3em" /></Icon></Center>
              </Box>
            </GridItem>
                        <GridItem>
              <Box justifySelf="center" style={ItemStyle} _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out" rounded="lg">
                <Center style={ItemTextStyle} >Wedight lifting</Center>
                <Center mt="0em" padding="1em"><Icon color="#2B4570" height="100%"><GiWeightLiftingUp size="3em"/></Icon></Center>
              </Box>
            </GridItem>
        </Grid>
      </Box>
    </Container>
  )
}
