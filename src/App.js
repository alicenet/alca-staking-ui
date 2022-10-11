import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Container } from "semantic-ui-react";
import { useSelector } from "react-redux";
import { StakeActions, Footer, Header } from "components";
import { ToastContainer } from 'react-toastify';
import ethAdapter from "eth/ethAdapter";

function App() {

    const state = useSelector(state => state);
    React.useEffect(() => {
        const debugPrint = (ev) => {
            if (ev.keyCode === 68) {
                console.log("Debug Printout:", state);
                return;
            }
        }
        document.addEventListener("keydown", debugPrint);
        return () => {
            document.removeEventListener("keydown", debugPrint);
        }
    })

    React.useEffect(() => {
        const depositEth = (ev) => {
            if (ev.shiftKey && ev.keyCode === 69) {
                ethAdapter.depositEth();
                return;
            }
        }
        document.addEventListener("keydown", depositEth);
        return () => {
            document.removeEventListener("keydown", depositEth);
        }
    })


    const DefaultRoutes = () => {
        return (
            <>
                <Route exact path="/" element={<StakeActions />} />
            </>
        )
    };

    return (

        <Container fluid className="">
            <BrowserRouter>
                <Header />
                <div className="overflow-auto pb-[112px] ">
                        <Routes>

                            {DefaultRoutes()}

                        </Routes>
                    <ToastContainer />
                </div>
                <Footer />
            </BrowserRouter>
        </Container>

    );
}

export default App;
