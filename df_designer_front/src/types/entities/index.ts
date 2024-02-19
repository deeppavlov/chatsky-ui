export type sidebarNavigationItemType = {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  current: boolean;
};

export type savedBuildType = {
  title: string
  timestamp: number
  duration: number
  runs: savedRunType[]
  type?: 'build'
  ago?: string
  logs?: string[]
  status?: 'ok' | 'error'
}

export type savedRunType = {
  type: 'run'
  status: 'ok' | 'error' | 'live'
  title: string
  timestamp: {
    start: number
    end: number
  }
  ago?: string
  logs?: string[]
}
