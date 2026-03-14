import { Card,Image, Box, Grid, GridItem, Heading, Link} from "@chakra-ui/react"
import { FaExternalLinkSquareAlt } from "react-icons/fa";

const fontLuckiestGuy = {
  fontFamily: 'LuckiestGuy'
}

export default function Projects() {
  return (
        <Grid templateRows="repeat(6, 1fr)" pt="2em"bg="rgba(0,0,0,0)">
              <GridItem justifySelf={{smDown: "center"}} rounded="lg" maxW={{smDown: "350px"}}>
                <Card.Root className="dropShadow" p="0em" mt="0" mb="4em" size="sm" flexDirection="row" overflow="hidden" maxW="3xl" ml="auto" _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out">
                  <Image
                    hideBelow="md"
                    objectFit="cover"
                    maxW="200px"
                    order="3"
                    src="/nordea.png"
                    alt="Caffe Latte"
                  />
                  <Box>
                    <Card.Body m="3em">

                      <Heading  as="h2" pb="2em" size="2xl" style={fontLuckiestGuy}>Nordea Netbank</Heading>
                      <Card.Description  color="#2B4570">
                        The Nordic Netbank project aimed to develop a completely new web and mobile bank, with a strong focus on design, usability, and security. It was initially based on Angular components, but over time Nordea developed its own design framework. You can get an overview of the netbank in the YouTube video below. My contributions have included hands-on frontend development, UX design, agile support as a Scrum Master, and business prioritization as a Product Owner.
                        <Link color="#2B4570" m="0em 1em" href="https://www.youtube.com/watch?v=cnQjPIU2grQ" target="_blank">Presentation of Nordea (Business) Netbank<FaExternalLinkSquareAlt  /></Link>
                      </Card.Description>
                    </Card.Body>
                    <Card.Footer>
                    </Card.Footer>
                  </Box>
                </Card.Root>
              </GridItem>
              <GridItem justifySelf={{smDown: "center"}} rounded="lg" maxW={{smDown: "350px"}} >
                <Card.Root className="dropShadow" p="0em" mt="0" mb="4em"  bg="#2B4570"  color="white" flexDirection="row" overflow="hidden" maxW="3xl" mr="auto" _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out">
                  <Image
                    hideBelow="md"
                    objectFit="cover"
                    maxW="200px"
                    src="/ikea.jpg"
                    alt="Caffe Latte"
                  />
                  <Box>
                    <Card.Body m="3em">
                      <Heading  as="h2" pb="2em" size="2xl" style={fontLuckiestGuy}>IKEA Project</Heading>
                      <Card.Description  color="white">
                        International IT project to develop a new webshop as well as infrastructure for IKEA. My role was Defect Manager and User Interface Developer. During my time as a developer, I worked mainly on the checkout flow, where we used vanilla, object-oriented JavaScript to build the frontend. The website has, of course, evolved since then, but it remains true to the original concept. Visit IKEA to get an idea of what I was part of developing.
                        <Link color="white" m="0em 1em" href="https://www.ikea.com/gb/en/shoppingcart/" target="_blank">IKEA check out flow<FaExternalLinkSquareAlt  /></Link>
                      </Card.Description>
                    </Card.Body>
                    <Card.Footer>
                    </Card.Footer>
                  </Box>
                </Card.Root>
              </GridItem>
              <GridItem justifySelf={{smDown: "center"}} rounded="lg" maxW={{smDown: "350px"}}>
                <Card.Root className="dropShadow" p="0em" mt="0" mb="4em" bg="white"  color="#2B4570" flexDirection="row" overflow="hidden" maxW="3xl" ml="auto" _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out">
                  <Image
                    hideBelow="md"
                    objectFit="cover"
                    maxW="200px"
                    order="3"
                     src="/smartwatch.png"
                    alt="Caffe Latte"
                  />
                  <Box>
                    <Card.Body m="3em">
                      <Heading  as="h2" pb="2em" size="2xl" style={fontLuckiestGuy}>Smartwatch app and CMS website (personal project)</Heading>
                      <Card.Description>
                      A smartwatch app and a CMS site where users could configure their own quizzes for their smartwatch. It was built using Java, PHP (Laravel), HTML5, Semantic UI, and SQL. The site is no longer online, but it can be found on the Wayback Machine here:
                       <Link color="#2B4570" href="https://web.archive.org/web/20180808002923/http://watchandspin.com/  " target="_blank" p="0em 1em">www.watchandspin.com <FaExternalLinkSquareAlt  /></Link>
                       If you would like to view a video demonstration of the website and app, you can find it here:
                       <Link color="#2B4570" href="https://www.youtube.com/watch?v=I02Dh1zemuM" target="_blank" p="0em 1em">demo on youtube <FaExternalLinkSquareAlt  /></Link>
                       If you would like to see the code, there is a link to the web repository here:
                       <Link color="#2B4570" href="https://github.com/christengc/www" target="_blank" p="0em 1em">Watchandspin website repository <FaExternalLinkSquareAlt  /></Link>
                       and the app repository here:
                        <Link color="#2B4570" href="https://github.com/christengc/Watch-IT-android-app" target="_blank" p="0em 1em">Watchandspin Android app repository <FaExternalLinkSquareAlt  /></Link>
                      </Card.Description>
                    </Card.Body>
                    <Card.Footer>
                    </Card.Footer>
                  </Box>
                </Card.Root>
              </GridItem>
              <GridItem justifySelf={{smDown: "center"}} rounded="lg" maxW={{smDown: "350px"}}>
                <Card.Root className="dropShadow" p="0em" mt="0" mb="4em" bg="cyan.solid"  color="white" flexDirection="row" overflow="hidden" maxW="3xl" mr="auto" _hover={{ boxShadow: "lg" , transform: "scale(1.02)"}} transition="all 0.3s ease-in-out">
                  <Image
                    hideBelow="md"
                    objectFit="cover"
                    maxW="200px"
                     src="/sammenspil.png"
                  />
                  <Box>
                    <Card.Body m="3em">
                      <Heading  as="h2" pb="2em" size="2xl" style={fontLuckiestGuy}>Micro Volunteering App (master project)</Heading>
                      <Card.Description  color="white">
                        In 2013, I developed an HTML5 application for web and mobile called “Sammenspil.dk.” It was built using jQuery, PHP, and MySQL, where people could volunteer or get help accomplishing microtasks.
                        <Link target="_blank" color="white" p="0em 1em" href="https://www2.imm.dtu.dk/pubdb/edoc/imm6558.pdf">Social Media Volunteering Application<FaExternalLinkSquareAlt/></Link>
                      </Card.Description>
                    </Card.Body>
                    <Card.Footer>
                    </Card.Footer>
                  </Box>
                </Card.Root>
              </GridItem>
              
        </Grid>
  )
}
