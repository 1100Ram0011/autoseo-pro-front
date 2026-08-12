import {
  FileText,
  TrendingUp,
  Target,
  Video,
  Users,
  Phone,
  BarChart,
  Zap,
} from 'lucide-react'

export const COMPANIES = [
  {
    name: 'Company 1',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png',
  },
  {
    name: 'Company 2',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/1200px-Facebook_f_logo_%282019%29.svg.png',
  },
  {
    name: 'Company 3',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png',
  },
  {
    name: 'Company 4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/LinkedIn_icon.svg/2048px-LinkedIn_icon.svg.png',
  },
  {
    name: 'Company 5',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Netflix_logo.svg/2560px-Netflix_logo.svg.png',
  },
  // Add more companies as needed
]

export const PROCESS = [
  {
    title: 'Analyze Trends',
    description:
      'Our AI scans millions of social signals to identify rising trends in your niche before they go mainstream.',
    icon: TrendingUp,
  },
  {
    title: 'Generate Content',
    description:
      'Get AI-written scripts, captions, and hashtags tailored to specific platforms for maximum engagement.',
    icon: FileText,
  },
  {
    title: 'Auto-Publish',
    description:
      'Schedule your content across all platforms with a single click. Our system handles the optimal posting times.',
    icon: Zap,
  },
]

export const CARDS = [
  {
    title: 'AI Trend Analysis',
    description: 'Spot viral opportunities before your competitors.',
    href: '#',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className="absolute top-0 h-[300px] w-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 opacity-20 blur-3xl" />
    ),
    Icon: TrendingUp,
  },
  {
    title: 'Smart Scheduling',
    description: 'Post at the perfect time for your audience, every time.',
    href: '#',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-2',
    background: (
      <div className="absolute right-0 top-0 h-[300px] w-full bg-gradient-to-l from-blue-500/20 to-cyan-500/20 opacity-20 blur-3xl" />
    ),
    Icon: BarChart,
  },
  {
    title: 'Growth Insights',
    description:
      'Deep dive into your performance metrics with AI-powered recommendations.',
    href: '#',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-2',
    background: (
      <div className="absolute right-0 top-0 h-[300px] w-full bg-gradient-to-l from-emerald-500/20 to-green-500/20 opacity-20 blur-3xl" />
    ),
    Icon: Target,
  },
  {
    title: 'Content Creation',
    description: 'Generate high-quality visuals and copy in seconds.',
    href: '#',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className="absolute right-0 top-0 h-[300px] w-full bg-gradient-to-l from-orange-500/20 to-yellow-500/20 opacity-20 blur-3xl" />
    ),
    Icon: Video,
  },
]

export const PLANS = [
  {
    name: 'Free',
    info: 'For individuals just starting out',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      { text: '5 AI Generations/mo', tooltip: 'Generate up to 5 posts' },
      { text: 'Basic Analytics', tooltip: 'View last 7 days of data' },
      { text: '1 Social Account', tooltip: 'Connect one platform' },
    ],
    btn: {
      text: 'Get Started',
      href: '#',
    },
  },
  {
    name: 'Pro',
    info: 'For creators and small businesses',
    price: {
      monthly: 29,
      yearly: 290,
    },
    features: [
      { text: 'Unlimited Generations', tooltip: 'No limits on AI usage' },
      { text: 'Advanced Analytics', tooltip: 'View 1 year of data' },
      { text: '5 Social Accounts', tooltip: 'Connect multiple platforms' },
      { text: 'Priority Support', tooltip: '24/7 email support' },
    ],
    btn: {
      text: 'Upgrade to Pro',
      href: '#',
    },
  },
  {
    name: 'Business',
    info: 'For agencies and large teams',
    price: {
      monthly: 99,
      yearly: 990,
    },
    features: [
      { text: 'Everything in Pro', tooltip: 'All Pro features included' },
      { text: 'Team Collaboration', tooltip: 'Add unlimited team members' },
      { text: 'API Access', tooltip: 'Integrate with your tools' },
      { text: 'Dedicated Account Manager', tooltip: '1-on-1 support' },
    ],
    btn: {
      text: 'Contact Sales',
      href: '/contact',
    },
  },
]

export const REVIEWS = [
  {
    name: 'Alice Johnson',
    username: '@alice_creates',
    review:
      'Borade.ai has completely transformed how I manage my social media. The AI content suggestions are spot on!',
    rating: 5,
  },
  {
    name: 'Mark Smith',
    username: '@mark_marketing',
    review:
      'The scheduling feature is a lifesaver. I save hours every week using this platform.',
    rating: 5,
  },
  {
    name: 'Sarah Lee',
    username: '@sarah_social',
    review:
      'Incredible insights. The growth metrics helped me double my following in 3 months.',
    rating: 4,
  },
  {
    name: 'David Kim',
    username: '@david_tech',
    review:
      'Best investment for my agency. The client reporting tools are fantastic.',
    rating: 5,
  },
  {
    name: 'Emma Wilson',
    username: '@emma_style',
    review: 'I love the simplified workflow. From idea to post in minutes.',
    rating: 5,
  },
  {
    name: 'James Brown',
    username: '@james_biz',
    review:
      'Highly recommend for anyone looking to scale their online presence.',
    rating: 4,
  },
]
