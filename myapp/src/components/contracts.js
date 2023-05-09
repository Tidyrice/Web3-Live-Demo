import { useEffect, useState } from 'react'
import { formatEther } from '@ethersproject/units'
import { utils } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import { useEthers } from '@usedapp/core'

import zoomArtifactJson from '../resources/ZoomToken.json';
import zoombiesArtifactJson from '../resources/Zoombies.json';
import { SubscribeZoomTransfer, SubscribeZoombiesTransfer, SubscribeZoombiesCardMinted, SubscribeDailyReward, SubscribePackOpened } from './listeners.js';

export default function Contracts() {

    const { account, chainId, library } = useEthers();


    //contract variables (zoom)
    const [zoomTotalSupply, setZoomTotalSupply] = useState(null);

    async function UpdateZoomTotalSupply(zoomContract) {
        setZoomTotalSupply(await zoomContract.totalSupply());
    }


    //contract variables (zoombies)
    const [zoombiesTotalSupply, setZoombiesTotalSupply] = useState(null);
    const [boosterCredits, setBoosterCredits] = useState(null);

    async function UpdateZoombiesTotalSupply(zoombiesContract) {
        setZoombiesTotalSupply(await zoombiesContract.totalSupply());
    }

    async function UpdateBoosterCredits(zoombiesContract, zoombiesContractAddress) {
        setBoosterCredits(await zoombiesContract.boosterCreditsOwned(zoombiesContractAddress));
    }


    //update contracts
    useEffect (() => {
        if (chainId === 1284 || chainId === 1285 || chainId === 1287) {

            //zoom
            const zoomWethInterface = new utils.Interface(zoomArtifactJson.abi);
            const zoomContractAddress = zoomArtifactJson.networks[chainId].address;
            const zoomContract = new Contract(zoomContractAddress, zoomWethInterface, library);

            UpdateZoomTotalSupply(zoomContract);
            SubscribeZoomTransfer(zoomContract); //TRANSFER ZOOM

    
            //zoombies
            const zoombiesWethInterface = new utils.Interface(zoombiesArtifactJson.abi);
            const zoombiesContractAddress = zoombiesArtifactJson.networks[chainId].address;
            const zoombiesContract = new Contract(zoombiesContractAddress, zoombiesWethInterface, library);

            UpdateZoombiesTotalSupply(zoombiesContract);
            UpdateBoosterCredits(zoombiesContract, zoombiesContractAddress);
            SubscribeZoombiesTransfer(zoombiesContract); //TRANSFER ZOOMBIES
            SubscribeZoombiesCardMinted(zoombiesContract); //MINT ZOOMBIES
            SubscribeDailyReward(zoombiesContract); //DAILY REWARD
            SubscribePackOpened(zoombiesContract); //PACK OPENED


            //clean up active listeners
            return () => {
                zoomContract.removeAllListeners();
                zoombiesContract.removeAllListeners();
            }

        }
    }, [chainId, library]);

    
    return (
        <div>

            {account && zoomTotalSupply && (
                <div>
        
                <b>Zoom token contract (total supply):</b>
                <p>{zoomTotalSupply ? formatEther(zoomTotalSupply) : ""}</p>
        
                <br />
        
                <b>Zoombies token contract (total supply):</b>
                <p>{zoombiesTotalSupply ? formatEther(zoombiesTotalSupply) : ""}</p>
        
                <br />
        
                <b>Zoombies token contract (credits owned):</b>
                <p>{boosterCredits ? formatEther(boosterCredits) : ""}</p>
        
                <br />
        
                </div>
            )}
            
        </div>
    )
}