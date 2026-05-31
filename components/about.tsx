"use client"

import { useState } from "react"

export function About() {
  const [posX, setPosX] = useState(50)
  const [posY, setPosY] = useState(10)

  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-black mb-6">
              About <span className="font-semibold">Me</span>
            </h2>
            <div className="w-24 h-px bg-purple-600 mx-auto"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-black mb-4">Background</h3>
                  <p className="text-large text-gray-700 leading-relaxed">
                    With a background in <span className="text-purple-600 font-medium">economics</span>,{" "}
                    <span className="text-purple-600 font-medium">finance</span>, and now{" "}
                    <span className="text-purple-600 font-medium">AI</span>, I thrive where disciplines intersect.
                    Numbers speak to me, and I speak to people. I enjoy deep diving into complex projects just as much
                    as turning insights into conversations with clients.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-black mb-4">Philosophy</h3>
                  <p className="text-large text-gray-700 leading-relaxed">
                    Success is built on the ability to cast a critical look at oneself, to always spot room for
                    improvement, and the will to overcome personal obstacles through a complex set of{" "}
                    <span className="text-purple-600 font-semibold">stamina</span>,{" "}
                    <span className="text-purple-600 font-semibold">optimism</span>, and{" "}
                    <span className="text-purple-600 font-semibold">hard work</span>.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-black mb-4">Vision</h3>
                  <p className="text-large text-gray-700 leading-relaxed">
                    Driven by curiosity and high standards, I seek environments that move fast, challenge me
                    intellectually, and reward initiative.
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="bg-white p-8 shadow-card">
                  <div className="w-full h-80 bg-gray-100 mb-6 flex items-center justify-center overflow-hidden">
                    <img
                      src="/thomas-headshot.jpg"
                      alt="Thomas Lefebvre"
                      className="w-full h-full object-cover transition-all duration-200"
                      style={{
                        objectPosition: `${posX}% ${posY}%`,
                      }}
                    />
                  </div>

                  {/* Reframing Controls - Development Only */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mb-6 space-y-4 border border-yellow-400 bg-yellow-50 p-4 rounded">
                      <p className="text-xs text-yellow-700 font-medium">Development Mode - Image Positioning Controls</p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Horizontal</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={posX}
                          onChange={(e) => setPosX(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vertical</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={posY}
                          onChange={(e) => setPosY(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  <blockquote className="text-center">
                    <p className="text-lg italic text-gray-600 font-serif">"I do it for the shareholder value"</p>
                  </blockquote>
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-purple-600 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
