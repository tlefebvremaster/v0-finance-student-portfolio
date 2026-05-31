"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Linkedin, Github } from "lucide-react"

export function Contact() {
  const openLinkedIn = () => {
    window.open("https://www.linkedin.com/in/thomas-lefebvre-a1311017a", "_blank")
  }

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-black mb-6">
              Get In <span className="font-semibold">Touch</span>
            </h2>
            <div className="w-24 h-px bg-purple-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {""}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-black mb-6">Let's Connect</h3>
              <p className="text-large text-gray-700 mb-8 leading-relaxed">
                I'm always interested in discussing new opportunities, collaborating on projects, or simply connecting with fellow passionates. Feel free to reach out!
              </p>

              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gray-50 mr-4">
                    <Mail className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <p className="font-semibold text-black">Email</p>
                    <p className="text-gray-600">Thomasl7513@hotmail.fr</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="p-3 bg-gray-50 mr-4">
                    <Phone className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <p className="font-semibold text-black">Phone</p>
                    <p className="text-gray-600">0769501852</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="p-3 bg-gray-50 mr-4">
                    <MapPin className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <p className="font-semibold text-black">Location</p>
                    <p className="text-gray-600">Paris, France</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <Button
                  onClick={openLinkedIn}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-none bg-transparent"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:border-purple-600 hover:text-purple-600 rounded-none bg-transparent"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              </div>
            </div>

            <Card className="border border-gray-100 shadow-card">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-black mb-6">Send a Message</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">First Name</label>
                      <Input placeholder="John" className="border-gray-200 rounded-none focus:border-purple-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Last Name</label>
                      <Input placeholder="Doe" className="border-gray-200 rounded-none focus:border-purple-600" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="john.doe@email.com"
                      className="border-gray-200 rounded-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Subject</label>
                    <Input
                      placeholder="Let's discuss opportunities"
                      className="border-gray-200 rounded-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Message</label>
                    <Textarea
                      placeholder="Tell me about your project or opportunity..."
                      rows={5}
                      className="border-gray-200 rounded-none focus:border-purple-600 resize-none"
                    />
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-none py-3">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
