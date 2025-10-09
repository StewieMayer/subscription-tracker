import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res
      .status(201)
      .json({ success: true, data: { subscription, workflowRunId } });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id },
      { ...req.body },
      { new: true }
    );

    if (!updateSubscription) {
      const error = new Error("There was a problem updating the subscription");
      error.statusCode = 300;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Subscription has been successfully updated",
      data: updatedSubscription,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const cancelledSubscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id },
      { status: "cancelled" },
      { new: true }
    );

    if (!cancelledSubscription) {
      const error = new Error(
        "There was a problem cancelling the subscription"
      );
      error.statusCode = 300;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Subscription has been successfully cancelled",
      data: cancelledSubscription,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const deletedSubscription = await Subscription.findByIdAndDelete(
      req.params.id
    );

    if (!deletedSubscription) {
      const error = new Error("There was a problem updating the subscription");
      error.statusCode = 300;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Subscription has been successfully deleted",
      data: deletedSubscription,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      const error = new Error("You are not the owner of this acount");
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find();

    res.status(201).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(201).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};
