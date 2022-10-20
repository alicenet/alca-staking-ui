import React from "react";
import ethAdapter from "eth/ethAdapter";
import { ethers } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import { APPLICATION_ACTIONS } from "redux/actions";
import { Grid, Header, Input, Button, Dimmer, Loader, Message, Modal } from "semantic-ui-react";
import { TOKEN_TYPES } from "redux/constants";
import { LOCK_APP_URL } from "utils/constants";

const DECIMALS = 18;
const ETHERSCAN_URL = process.env.REACT_APP__ETHERSCAN_TX_URL || "https://etherscan.io/tx/";

export function StakeStake() {
    const { tokenId, alcaBalance, alcaStakeAllowance } = useSelector(state => ({
        tokenId: state.application.stakedPosition.tokenId,
        alcaBalance: state.application.balances.alca,
        alcaStakeAllowance: state.application.allowances.alcaStakeAllowance
    }))

    const dispatch = useDispatch();
    const [stakeAmt, setStakeAmt] = React.useState('');
    const [waiting, setWaiting] = React.useState(false);
    const [errorLocking, setErrorLocking] = React.useState(false);
    const [status, setStatus] = React.useState({});
    const [allowanceMet, setAllowanceMet] = React.useState(false);
    const [hash, setHash] = React.useState('');
    const [multipleTx, setMultipleTx] = React.useState('');
    const [aboutModalOpen, setAboutModalOpen] = React.useState(false);

    React.useEffect(() => {
        setStakeAmt('');
    }, [])

    const updateStakeAmt = (amt) => {
        if (amt === "." || amt === "") {
            return setStakeAmt("");
        }
        if (!/^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/.test(amt)) {
            return;
        }
        let split = amt.split(".");
        if (split[0].length >= 11 || (split[1] && split[1].length > 18)) {
            return
        }
        setStakeAmt(amt);
    }

    React.useEffect(() => {
        try {
            if (!stakeAmt) return;
            const parsedStakeAmt = ethers.utils.parseUnits(stakeAmt || "0", DECIMALS);

            setStatus({});

            setAllowanceMet(ethers.BigNumber.from(alcaStakeAllowance || 0).gte(parsedStakeAmt));

            if (parsedStakeAmt.gt(ethers.utils.parseUnits(alcaBalance || "0", DECIMALS))) {
                setStatus({
                    error: true,
                    message: "Stake amount higher than current balance"
                });
            }
        } catch (exc) {
            setStatus({
                error: true,
                message: "There was a problem with your input, please verify"
            });
        }
    }, [stakeAmt, alcaBalance, alcaStakeAllowance]);

    const approveStaking = async () => {
        const tx = await ethAdapter.sendStakingAllowanceRequest(stakeAmt);
        if (tx.error) throw tx.error;
        const rec = tx.hash && await tx.wait();

        if (rec.transactionHash) {
            setHash(rec.transactionHash);
            setMultipleTx('1/2 completed');
            setStatus({
                error: false,
                message: `You have successfully allowed ${stakeAmt} ALCA`
            });
        }
    }

    const stake = async () => {
        const tx = await ethAdapter.openStakingPosition(stakeAmt);
        if (tx.error) throw tx.error;
        const rec = await tx.wait();

        if (rec.transactionHash) {
            await dispatch(APPLICATION_ACTIONS.updateBalances(TOKEN_TYPES.ALL));
            setHash(rec.transactionHash);
            setStakeAmt('');
            setStatus({
                error: false,
                message: `You have successfully staked ${stakeAmt} ALCA`
            });
        }
    }

    const handleStaking = async () => {
        try {
            setWaiting(true);
            setHash('');
            setMultipleTx('');
            setStatus({});

            if (allowanceMet) await stake();

            if (!allowanceMet) {
                await approveStaking();
                await stake();
            }

            setWaiting(false);
        } catch (exception) {
            setStatus({
                error: true,
                message: exception || "There was a problem with your request, please verify or try again later"
            });
            setWaiting(false);
        }
    }

    const handleLocking = async () => {
        try {
            setErrorLocking(false)
            setWaiting(true);
            setHash('');
            setMultipleTx('');
            setStatus({});

            const tx = await ethAdapter.safeTransferFromPublicStakingNFT(tokenId);
            if (tx.error) throw tx.error;
            const rec = await tx.wait();

            if (rec.transactionHash) {
                await dispatch(APPLICATION_ACTIONS.updateBalances(TOKEN_TYPES.ALL));
                setHash(rec.transactionHash);
                setStatus({
                    error: false,
                    message: "You have successfully locked your NFT"
                });
            }

            setWaiting(false);
        } catch (exception) {
            setStatus({
                error: true,
                message: exception || "There was a problem with your request, please verify or try again later"
            });
            setErrorLocking(true)
            setWaiting(false);
        }
    }

    /////////////////////
    /* Render function */
    ////////////////////
    function renderMessage() {
        if (!status?.message || status?.error) return <></>

        return (
            <div className="bg-[#245979] p-4 rounded-md">
                <Header>
                    <div className="mb-4 text-base text-[#fff]">
                        {status?.message}
                    </div>

                    <Header.Subheader className="text-[#fff]">
                        You can check the transaction hash below {hash}
                    </Header.Subheader>
                </Header>
            </div>
        )

    }

    function renderLockNftButton(text) {
        text = text || "Lock My Stake"

        return (
            <Button
                content={text}
                secondary
                onClick={handleLocking}
            />
        )
    }

    function renderStakeSuccessButtons() {
        if (!status?.message || status?.error) return <></>;

        return (
            <div className="flex mt-4">
                <div>
                    <Button
                        content={"View on Etherscan"}
                        secondary
                        onClick={() => window.open(`${ETHERSCAN_URL}${hash}`, '_blank').focus()}
                    />
                </div>
                <div className="ml-4">
                    {renderLockNftButton()}
                </div>
            </div>
        )
    }

    function renderRetryLockNftButton() {
        if (!errorLocking) return <></>;

        return (
            <div className="flex mt-6">
                {renderLockNftButton("Retry Lock My Stake")}
            </div>
        )
    }

    const StakingHeader = () => {
        return (
            <>
                {renderMessage()}

                <Header>Stake your ALCA
                    <Header.Subheader>
                        {alcaBalance} available for staking
                    </Header.Subheader>
                </Header>
                <div className="text-xs font-bold">
                    You will need to sign two transactions to stake your ALCA
                </div>
            </>
        )
    }


    return (<>

        <Modal open={aboutModalOpen} onClose={() => setAboutModalOpen(false)}>
            <Modal.Header>About</Modal.Header>
            <Modal.Content>
                Lorem Ipsum . . .
            </Modal.Content>
        </Modal>

        <Grid padded>
            {waiting && (
                <Dimmer inverted active>
                    <Loader indeterminate>
                        {multipleTx ? multipleTx : 'Processing Transaction..'}
                    </Loader>
                </Dimmer>
            )}

            <Grid.Column width={16}>
                <StakingHeader />
            </Grid.Column>

            <Grid.Column width={16}>
                {(!status?.message || status.error) && (
                    <>
                        <div>
                            <Input
                                placeholder={`Amount to stake`}
                                value={stakeAmt}
                                type="text"
                                inputMode="decimal"
                                pattern="^[0-9]*[.]?[0-9]*$"
                                onChange={e => e.target.validity.valid && updateStakeAmt(e.target.value)}
                                action={{
                                    content: "Max",
                                    onClick: () => { setStakeAmt(alcaBalance) }
                                }}
                            />
                        </div>

                        <div>
                            <Button
                                className="mt-4"
                                secondary
                                content={
                                    (!alcaStakeAllowance || !stakeAmt)
                                        ? "Enter an amount"
                                        : allowanceMet ? "Stake ALCA" : `Stake ${stakeAmt} ALCA`
                                }
                                onClick={handleStaking}
                                disabled={!stakeAmt || ethers.utils.parseUnits(stakeAmt || "0", DECIMALS).gt(ethers.utils.parseUnits(alcaBalance || "0", DECIMALS))}
                            />

                            <div
                                className="cursor-pointer text-xs mt-4 underline"
                                onClick={() => setAboutModalOpen(true)}
                            >
                                About ALCA Staked rewards
                            </div>
                        </div>
                    </>
                )}

                {renderStakeSuccessButtons()}

                {renderRetryLockNftButton()}
            </Grid.Column>

            {status.error && (
                <Grid.Column width={16}>
                    <Message negative>
                        <p>{status.message}</p>
                    </Message>
                </Grid.Column>
            )}
        </Grid>
    </>
    )
}
