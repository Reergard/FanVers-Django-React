import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '../authSlice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, isSuccess, isLoading, isError, userInfo, isAuthenticated } = 
        useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && !isLoading && !isError && !userInfo) {
            dispatch(getProfile());
        }
    }, [dispatch, isAuthenticated, isLoading, isError, userInfo]);

    return { 
        user, 
        isSuccess, 
        isLoading, 
        isError, 
        userInfo, 
        isAuthenticated 
    };
};
