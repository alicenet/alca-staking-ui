import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { APPLICATION_ACTIONS } from "redux/actions";
import ethAdapter from "eth/ethAdapter";
import { Grid, Header, Button, Icon, Message } from "semantic-ui-react";
import utils from "utils";
import { TOKEN_TYPES } from "redux/constants";

const ETHERSCAN_URL = process.env.REACT_APP__ETHERSCAN_TX_URL || "https://etherscan.io/tx/";

export function StakeUnstake() {
    const dispatch = useDispatch();
    const [waiting, setWaiting] = React.useState(false);
    const [success, setSuccessStatus] = React.useState(false);
    const [status, setStatus] = React.useState({});
    const [txHash, setTxHash] = React.useState('');
    const [untakedAmount, setUnstakedAmount] = React.useState('');
    const [claimedRewards, setClaimedRewards] = React.useState('');

    const { stakedAlca, tokenId, ethRewards } = useSelector(state => ({
        stakedAlca: state.application.stakedPosition.stakedAlca,
        tokenId: state.application.stakedPosition.tokenId,
        ethRewards: state.application.stakedPosition.ethRewards,
    }))

    const unstakePosition = async () => {
        try {
            setWaiting(true);
            setStatus({});

            const tx = await ethAdapter.unstakingPosition(tokenId);
            if (tx.error) throw tx.error;
            const rec = tx.hash && await tx.wait();
            
            if(rec.transactionHash) {
                await dispatch(APPLICATION_ACTIONS.updateBalances(TOKEN_TYPES.ALL));
                setWaiting(false);
                setSuccessStatus(true);
                setUnstakedAmount(stakedAlca);
                setClaimedRewards(ethRewards);
                setTxHash(rec.transactionHash);
            }
        } catch (exception) {
            setStatus({
                error: true,
                message: exception || "There was a problem with your request, please verify or try again later"
            });
            setWaiting(false);
        }
    }

    const renderRequestUnstake = () => (
        <>
            <Grid.Column width={16}>
                <Header>Unstake ALCA Position
                    <Header.Subheader>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                    incididunt ut labore et dolore magna aliqua.
                    </Header.Subheader>
                </Header>
            </Grid.Column>

            <Grid.Column width={16}>
                <div>
                    <Header as="h2">{stakedAlca} ALCA</Header>
                    <Header as="h3">Rewards to Claim: {ethRewards} ETH</Header>
                    <p>Rewards will be sent automatically to your wallet</p>
                </div>

                <div>
                    <Button
                        className="mt-4"
                        color="black"
                        content={"Unstake Position"}
                        onClick={unstakePosition}
                        disabled={false}
                        loading={waiting}
                    />
                </div>
            </Grid.Column>
        </>
    )

    const renderUnstakedSuccessfully = () => (
        <>
            <Grid.Column width={16}>
                <Header>Unstake completed
                    <Header.Subheader>
                        <strong>You have successfully unstaked {untakedAmount} ALCA</strong> and claimed a{' '} 
                        <strong>reward of {claimedRewards} ETH</strong> to your wallet
                    </Header.Subheader>
                </Header>
            </Grid.Column>

            <Grid.Column width={16}>
                <div>
                    <p>You can check the transaction hash below</p>
                    <p>
                        {txHash}
                        <Icon
                            name="copy"
                            className="cursor-pointer"
                            onClick={() => utils.string.copyText(txHash)}
                        />
                    </p>
                </div>

                <div>
                    <Button
                        className="mt-4"
                        color="black"
                        content={"View on Etherscan"}
                        onClick={() => window.open(`${ETHERSCAN_URL}${txHash}`, '_blank').focus()}
                    />
                </div>
            </Grid.Column>

        </>
    )

    return (
        <Grid padded >
            {success ? renderUnstakedSuccessfully() : renderRequestUnstake()}

            {status.error && (
                <Grid.Column width={16}>
                    <Message negative>
                        <p>{status.message}</p>
                    </Message>
                </Grid.Column>
            )}
        </Grid>
    )
}
