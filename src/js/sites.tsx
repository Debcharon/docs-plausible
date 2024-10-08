import React, { ReactNode, createContext, useEffect, useState } from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'

export type SiteContextType = {
  loading: boolean,
  isLoggedIn: boolean,
  sites: Array<string>,
  selectedSite: string,
  selectSite: (siteDomain: string) => void,
}

export const SiteContext = createContext<SiteContextType>(null)

function NestedProvider({ children }) {
  const [sites, setSites] = useState({
    loading: true,
    isLoggedIn: false,
    sites: [] as Array<string>
  })

  const [selectedSite, setSelectedSite] = useState(localStorage.getItem("plausible_docs_site"))

  function selectSite(siteDomain: string) {
    localStorage.setItem("plausible_docs_site", siteDomain)
    setSelectedSite(siteDomain)
  }

  useEffect(() => {
    async function loadSites() {
      const response = await fetch("/api/sites")

      if (response.status === 200) {
        const { data } = await response.json()
        const dataSites = data.map((site) => site.domain)

        setSites({
          loading: false,
          isLoggedIn: true,
          sites: dataSites
        })

        if (!dataSites.includes(selectedSite)) {
          setSelectedSite(dataSites[0])
        }
      } else {
        setSites({
          loading: false,
          isLoggedIn: false,
          sites: []
        })
      }
    }
    loadSites()
  }, [])

  return (
    <SiteContext.Provider value={{ ...sites, selectedSite, selectSite }}>
      {children}
    </SiteContext.Provider>
  )
}

// Ensure that content requiring site data is only rendered in the browser
export function SiteContextProvider(props: { children: ReactNode }) {
  return (
    <BrowserOnly>
      {() => (<NestedProvider>{props.children}</NestedProvider>)}
    </BrowserOnly>
  )
}
