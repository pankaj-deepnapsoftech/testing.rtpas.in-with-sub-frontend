// @ts-nocheck
export const LeftSubscriptionDays = (date) => {
    const endDate = new Date(date);
    const now = new Date();

    // difference in milliseconds
    const diffMs = endDate - now;

    // convert to days
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays.toFixed();

};

export const CheckSubscriptionIsEnd = (date) => {
    const endDate = new Date(date);
    endDate.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate()+2);
    yesterday.setHours(0, 0, 0, 0);



    return endDate <= yesterday;
}



export const isSubscriptionEnd = (date) => {
  const endDate = new Date(date);
    const now = new Date();

    return endDate < now 
}