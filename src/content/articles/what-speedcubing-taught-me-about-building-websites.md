---
title: "What Speedcubing Taught Me About Building Websites"
date: "2026-08"
summary: "Sixty-five Rubik's Cube competitions and two World Championships have shaped how I plan, build and launch websites more than I expected. Five lessons from the cube that I use at work."
seoTitle: "What Speedcubing Taught Me About Building Websites"
seoDescription: "A Brisbane web developer and WCA Delegate on five lessons from competitive Rubik's Cube solving that shape how he plans, builds and launches websites."
tags: ["Speedcubing", "Process"]
coverText: "Cubing, but for websites"
# Shown behind the cover text and gradient on article cards. The gradient is
# solid on the left, so the subject should sit on the right.
coverImage: "/images/articles/seattle_clk_large.png"
coverPosition: "right center"
relatedServices: []
---

On weekends I solve Rubik's Cubes against the clock. I've competed at 65 official competitions, including two World Championships, my best 3x3 solve is 8.87 seconds, and I'm a Delegate for the World Cube Association, which means I help run competitions and make sure they follow the rules.

During the week I build websites. I didn't expect the two to have much in common, but the longer I do both, the more habits from the cube show up in my work. Here are five of them.

## Plan before you start the clock

At a competition, you get 15 seconds to look at the scrambled cube before you start solving. Go over 15 seconds and you get a two-second penalty. Go over 17 and the solve doesn't count.

Nobody spends that time admiring the cube. You use it to plan the first stage of the solve, so that when the timer starts your hands already know where they're going. A solve that starts without a plan spends the first few seconds finding one.

Websites work the same way. The discovery stage, where I ask who the site is for, what they need to find and who will update it afterwards, feels slow because nothing visible gets made. It's still the cheapest place to change your mind. Moving a section in a wireframe takes a minute. Moving it after the CMS is built takes a day.

## The pauses cost more than slow turns

Beginners think fast solvers turn the cube faster. Mostly they don't pause. The skill that separates them is called lookahead: while your hands solve one piece, your eyes are already finding the next one. A solver who turns slowly but never stops will beat one who turns quickly and stops to look around.

Projects are similar. The build itself is rarely what makes a website late. The time goes on waiting for content, a login, a decision or feedback. So I try to line up the next thing while working on the current one: asking for the menu copy and photos while I'm still designing the homepage, or getting access to the domain long before launch week, so nothing stalls.

## Your average matters more than your best solve

My 8.87 is a single, one solve where everything went right. It's not what ranks me. For most events, official rankings use an average: five solves, with the best and worst dropped and the middle three averaged. A good average means you're fast when things go wrong, not just when they go right.

Websites have the same split. It's easy to judge a site on its best case: the latest laptop, fast office Wi-Fi, a page you've already loaded. Your visitors get the average case: a mid-range phone, a patchy mobile connection, arriving on whatever page Google sent them to. I test for that. On [Speedcubing Australia's site](/work/speedcubing-australia/), that meant checking every page from 320px wide, because most visitors are on a phone, often standing in a competition venue.

## The shortest solution takes the most thinking

One event, Fewest Moves, isn't about speed at all. You get an hour, a pen, paper and a scramble, and the goal is to write down the shortest solution you can find. It's my best event: my best result is 23 moves, which ranks 17th in Australia as I write this, and I won silver in it at the 2025 Queensland Quiet State Championship.

What Fewest Moves teaches is that the first solution you find is almost never the shortest. The short one comes from trying several approaches and throwing most of them away.

I think about this when a project wants another plugin, another script or another tool. The simplest version usually takes more thought up front, but it has fewer parts to break. Speedcubing Australia's competition finder is one self-contained script with no framework behind it. [This site](/nextjs-development/) is plain static files, with no server or database to look after.

## Rules and checklists keep it fair when you're busy

As a Delegate, my job at a competition is making sure every competitor gets a fair, official result. The WCA's regulations cover everything from how puzzles are scrambled to what happens when a timer misbehaves, and a lot of running a competition is following procedure carefully while a hundred other things are happening.

Procedure exists because memory fails on busy days. The same is true of a website launch, which is why I go through the same [pre-launch checklist](/articles/website-launch-checklist/) on every site, even the small ones. The day a site launches is a busy day, and that's when a forgotten redirect or a form sending to the wrong inbox slips through.

## And remember who's new

Something running competitions makes obvious is how many people in the room are there for the first time, along with their parents, who often have no idea what's going on. A competition that only makes sense to regulars loses people.

That's why the [new Speedcubing Australia site](/work/speedcubing-australia/) has a "What is Speedcubing?" section on the homepage. A beta tester pointed out that many people arriving from Google don't know what speedcubing is yet. Every business has its own version of this: words that are obvious to the people inside it and mean nothing to someone visiting the website for the first time.

If you're curious about the cubing side, my results and every competition I've attended are on [my About page](/about/). If you want a website built with the same care, [send me a message on LinkedIn](https://www.linkedin.com/in/mitchell-anderson-527au/).
