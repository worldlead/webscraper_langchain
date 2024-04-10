import ThemeConfigurator from '@/components/template/ThemeConfigurator'
import type { ThemeConfiguratorProps } from '@/components/template/ThemeConfigurator'

export type SidePanelContentProps = ThemeConfiguratorProps

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SidePanelContent = (props: SidePanelContentProps) => {
    return <ThemeConfigurator {...props} />
}

export default SidePanelContent
