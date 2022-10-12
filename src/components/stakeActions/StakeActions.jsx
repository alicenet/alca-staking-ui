import React from "react";
import { useSelector } from "react-redux";
import { Grid, Menu, Segment, Header } from "semantic-ui-react";
import { Connect, StakeClaim, StakeStake, StakeUnstake, StakeWelcome } from "components";
import { classNames } from "utils/generic";

export function StakeActions() {

    const { hasReadTerms, alcaBalance, web3Connected, stakedAlca, ethRewards, alcaRewards } = useSelector(state => ({
        hasReadTerms: state.application.hasReadTerms,
        alcaBalance: state.application.balances.alca,
        web3Connected: state.application.web3Connected,
        stakedAlca: state.application.stakedPosition.stakedAlca,
        ethRewards: state.application.stakedPosition.ethRewards,
        alcaRewards: state.application.stakedPosition.alcaRewards
    }))

    const [activeItem, setActiveItem] = React.useState("welcome");

    const handleItemClick = (e, { name }) => {
        setActiveItem(name);
    };

    const getActiveTab = () => {
        switch (activeItem) {
            case "welcome": return <StakeWelcome stepForward={() => stakedAlca > 0 ? setActiveItem("unstake") : setActiveItem("stake")} />
            case "stake": return <StakeStake />
            case "unstake": return <StakeUnstake />
            case "claim": return <StakeClaim />
            default: return;
        }
    };

    const activeMenuClass = (checkAgainst) => {
        return checkAgainst === activeItem ? "border-l-aliceblue border-l-[3px]" : ""
    }

    return (
        <div className="flex justify-center w-full">

            <div className="max-w-[1200px] w-full mt-12">

                <Grid padded className="flex h-full">

                    <Grid.Row>
                        <Grid.Column stretched width={3} className="pr-0">
                            <Menu fluid vertical tabular>
                                <Menu.Item
                                    content={<Header content="Welcome" />}
                                    active={activeItem === 'welcome'}
                                    onClick={e => handleItemClick(e, { name: "welcome" })}
                                    disabled={activeItem !== "welcome"}
                                    className={activeMenuClass("welcome")}
                                />

                                <Menu.Item
                                    content={<>
                                        <Header className={classNames({ "opacity-40": !hasReadTerms || stakedAlca || !web3Connected })}>Stake</Header>
                                        <div className="text-xs">
                                            {Number(alcaBalance).toLocaleString(false, { maximumFractionDigits: 4 })} ALCA Available
                                        </div>
                                    </>}
                                    disabled={Boolean(!hasReadTerms || stakedAlca || !web3Connected)}
                                    active={activeItem === 'stake'}
                                    onClick={e => handleItemClick(e, { name: "stake" })}
                                    className={activeMenuClass("stake")}
                                />

                                <Menu.Item
                                    content={<>
                                        <Header className={classNames({ "opacity-40": !hasReadTerms || !stakedAlca > 0 })}>Unstake</Header>
                                        <div className="text-xs">
                                            {stakedAlca > 0
                                                ? `${stakedAlca} ALCA`
                                                : "No ALCA staked"}
                                        </div>
                                    </>}
                                    disabled={Boolean(!hasReadTerms || !stakedAlca)}
                                    active={activeItem === 'unstake'}
                                    onClick={e => handleItemClick(e, { name: "unstake" })}
                                    className={activeMenuClass("unstake")}
                                />

                                <Menu.Item
                                    content={<>
                                        <Header className={
                                            classNames({ "opacity-40": !hasReadTerms || [0, "0.0"].includes(ethRewards) || !stakedAlca })
                                        }>
                                            Rewards
                                        </Header>

                                        <div className="text-xs">
                                            {ethRewards > 0 ? `${ethRewards} ETH to claim` : "No ETH to claim"}
                                        </div>
                                        {/* <div className="text-xs">
                                            {alcaRewards > 0 ? `${alcaRewards} ALCA to claim` : "No ALCA to claim"}
                                        </div> */}
                                    </>}
                                    disabled={Boolean(!hasReadTerms || [0, "0.0"].includes(ethRewards) || !stakedAlca)}
                                    active={activeItem === 'claim'}
                                    onClick={e => handleItemClick(e, { name: "claim" })}
                                    className={activeMenuClass("claim")}
                                />
                            </Menu>
                        </Grid.Column>

                        <Grid.Column stretched width={13} className="pl-0">
                            <Segment className="border-l-0 shadow-none rounded-none">
                                {getActiveTab()}
                            </Segment>
                        </Grid.Column>

                    </Grid.Row>

                </Grid>

            </div>

        </div>
    );

}
